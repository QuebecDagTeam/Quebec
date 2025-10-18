import { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/users";  // Updated model import based on the new schema
import KycRecord from "../models/KYCRecord";  // Assuming you have the KYCRecord model
import { DAGKYC_ABI } from "../config/ABI";
import users from "../models/users";
import ThirdParty from "../models/thirdParty";
import NotificationModel from "../models/notify";

const RPC = process.env.RPC_URL;
const CONTRACT_ADDRESS = (process.env.DAGKYC_ADDRESS || "").toLowerCase();
const provider = new ethers.providers.JsonRpcProvider(RPC);
const contract = new ethers.Contract(CONTRACT_ADDRESS, DAGKYC_ABI, provider);

// Utility to convert address to to format
function toto(addr: string) {
  try {
    return ethers.utils.getAddress(addr);
  } catch {
    return addr.toLowerCase();
  }
}

/**git pus
 * POST /api/kyc/register
 * body: { walletAddress, encryptedData, transactionHash, NIN?, email? }
 * Registers the user’s KYC data and creates a new user entry if required.
 */
export const Register = async (req: Request, res: Response) => {
  try {
    const { walletAddress, encryptedData, transactionHash, NIN, email } = req.body;

    if (!walletAddress || !encryptedData || !transactionHash) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists with the provided wallet address
    const existingUser = await User.findOne({ walletAddress: toto(walletAddress) });
    if (existingUser) {
      return res.status(400).json({ error: "Wallet address already registered" });
    }

    // Generate a unique KYC ID
    const uniqueId = `KYC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create a new KYC record
    // const newKYC = new KycRecord({
    //   walletAddress: toto(walletAddress),
    //   encryptedData,
    //   transactionHash,
    //   uniqueId,
    //   timestamp: new Date(),
    // });

    // Create a new user entry
    const newUser = new User({
      walletAddress: toto(walletAddress),
      NIN,
      email,
      kyc: {
        encryptedData,
        uniqueId,
        transactionHash,
        userType: "user",  // Defaulting to "user", you can change based on your needs
        timestamp: new Date(),
      },
    });

    // Save KYC record and user
    // await newKYC.save();
    await newUser.save();

    return res.status(201).json({ message: "User and KYC registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error saving KYC and User" });
  }
};

/**
 * GET /api/kyc/is-registered/:walletAddress
 * Returns { registered: true | false }
 */
export const isWalletRegistered = async (req: Request, res: Response) => {
  try {
    const wallet = toto(req.params.walletAddress);
    const user = await User.findOne({ walletAddress: wallet });

    return res.json({ registered: !!user });
  } catch (err) {
    console.error("isWalletRegistered error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/kyc/is-nin-registered/:NIN
 * Returns { registered: true | false }
 */
export const isNINRegistered = async (req: Request, res: Response) => {
  try {
    const { NIN } = req.params;
    const user = await User.findOne({ NIN });

    return res.json({ registered: !!user });
  } catch (err) {
    console.error("isNINRegistered error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/kyc/is-email-registered/:email
 * Returns { registered: true | false }
 */
export const isEmailRegistered = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    return res.json({ registered: !!user });
  } catch (err) {
    console.error("isEmailRegistered error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/kyc/grant
 * Body: { ownerAddress, kycId, recipient, txHash, recipientEncryptedSymKey }
 * Grants access to encrypted KYC data for a third-party recipient
 */

// Grant access

// Grant access

// ✅ Grant Access
export const grantAccess = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { uniqueId, recipient, txHash, ownerAddress } = req.body;

    if (!uniqueId || !recipient || !txHash || !ownerAddress) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 1️⃣ Find user by uniqueId
    const userDoc = await User.findOne({ "kyc.uniqueId": uniqueId });
    if (!userDoc) return res.status(404).json({ error: "KYC record not found" });

    // 2️⃣ Update User whitelist entry
    const existingEntry = userDoc.whitelistedThirdParties.find(
      (party: any) => party.kycId === uniqueId && party.thirdPartyAddress === recipient
    );

    if (existingEntry) {
      if (existingEntry.status === "granted") {
        return res.status(400).json({ error: "Access already granted" });
      }

      existingEntry.status = "granted";
      existingEntry.grantedAt = new Date();
      existingEntry.revokedAt = null;
    } else {
      userDoc.whitelistedThirdParties.push({
        thirdPartyAddress: recipient,
        kycId: uniqueId,
        status: "granted",
        grantedAt: new Date(),
      });
    }

    userDoc.kyc.transactionHash = txHash;
    await userDoc.save();

    // 3️⃣ Update ThirdParty.authorizedUsers
    const thirdPartyDoc = await ThirdParty.findOne({ walletAddress: recipient });

    if (thirdPartyDoc) {
      const authUser = thirdPartyDoc.authorizedUsers.find(
        (u: any) => u.kycId === Number(uniqueId)
      );

      if (authUser) {
        authUser.accessStatus = "granted";
        authUser.grantedAt = new Date();
        authUser.revokedAt = null;
      } else {
        thirdPartyDoc.authorizedUsers.push({
          userAddress: ownerAddress,
          kycId: Number(uniqueId),
          accessStatus: "granted",
          grantedAt: new Date(),
          revokedAt: null,
        });
      }

      await thirdPartyDoc.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("grantAccess error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ Revoke Access
export const revokeAccess = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { uniqueId, recipient, txHash, ownerAddress } = req.body;

    if (!uniqueId || !recipient || !txHash || !ownerAddress) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 1️⃣ Find user by uniqueId
    const userDoc = await User.findOne({ "kyc.uniqueId": uniqueId });
    if (!userDoc) return res.status(404).json({ error: "KYC record not found" });

    // 2️⃣ Revoke from User whitelist
    const existingEntry = userDoc.whitelistedThirdParties.find(
      (party: any) => party.kycId === uniqueId && party.thirdPartyAddress === recipient
    );

    if (!existingEntry || existingEntry.status === "revoked") {
      return res.status(400).json({ error: "Access is already revoked or never granted" });
    }

    existingEntry.status = "revoked";
    existingEntry.revokedAt = new Date();
    userDoc.kyc.transactionHash = txHash;
    await userDoc.save();

    // 3️⃣ Update ThirdParty.authorizedUsers
    const thirdPartyDoc = await ThirdParty.findOne({ walletAddress: recipient });

    if (thirdPartyDoc) {
      const authUser = thirdPartyDoc.authorizedUsers.find(
        (u: any) => u.kycId === Number(uniqueId)
      );

      if (authUser) {
        authUser.accessStatus = "revoked";
        authUser.revokedAt = new Date();
      }

      await thirdPartyDoc.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("revokeAccess error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


/**
 * GET /api/kyc/record/:uniqueId
 * Returns KYC record by uniqueId
 */

export const getRecordByAddress = async (req: Request, res: Response) => {
  try {
    const wallet = toto(req.params.walletAddress);
    const doc = await User.findOne({ walletAdress:wallet });
    if (!doc) {
      return res.status(404).json({ error: "KYC record not found" });
    }

    return res.json({
      NIN: doc.NIN,
      email: doc.email,
      ownerAddress: doc.walletAddress,
      kycDetails: doc.kyc,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("getRecordByUniqueId error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};



// Delete KYC Data by Wallet Address
const deleteKYC = async (req: Request, res: Response): Promise<Response> => {
  const { walletAddress } = req.params; // Get wallet address from the URL parameter
  
  try {
    // Find and delete the KYC document by wallet address
    const result = await User.findOneAndDelete({ walletAddress });

    // If no KYC document is found, return an error message
    if (!result) {
      return res.status(404).json({ message: 'KYC data not found for the given wallet address' });
    }

    // Successfully deleted KYC data
    return res.status(200).json({ message: 'KYC data successfully deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while deleting the KYC data', error });
  }
};

export default deleteKYC;


// Controller to register KYC data
export const ThirdPartyReg = async (req: Request, res: Response) => {
  const {
    appName,
    detail,
    description,
    website,
    walletAddress,
    transactionHash,
  } = req.body;

  // Simple validation
  if (!appName || !description || !walletAddress || !transactionHash) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if the user has already registered
    const existingUser = await ThirdParty.findOne({ walletAddress });
    if (existingUser) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Save the new KYC record to the database
    const newKyc = new ThirdParty({
      appName,
      detail,
      description,
      website,
      walletAddress,
      transactionHash,
    });

    await newKyc.save();

    // Respond with success
    return res.status(200).json({ message: "KYC registration successful!" });
  } catch (error) {
    console.error("Error registering KYC:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getThirdPartyRecord = async (req: Request, res: Response) => {
  try {
    const { walletAdress } = req.params;
    const doc = await ThirdParty.findOne({ walletAdress });
    if (!doc) return res.status(404).json({ error: "KYC record not found" });

    return res.json({
      doc
    });
  } catch (err) {
    console.error("getRecordByUniqueId error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const isRegistered_thirdParty = async (req: Request, res: Response) => {
  try {
    const wallet = toto(req.params.walletAddress);
    const user = await ThirdParty.findOne({ walletAddress: wallet });

    return res.json({ registered: !!user });
  } catch (err) {
    console.error("isWalletRegistered error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


//createNotification
// Controller to get a notification by ID




/**
 * @desc Get notifications for a recipient (by `to` param)
 * @route GET /api/notifications/:to
 */
export const getNotification = async (req: Request, res: Response): Promise<Response> => {
  const { to } = req.params;

  try {
    const notifications = await NotificationModel.find({ to }).sort({ createdAt: -1 });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found",
      });
    }

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("getNotification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving notifications",
    });
  }
};

/**
 * @desc Update notification read status
 * @route PATCH /api/notifications/read
 */
export const updateNotification = async (req: Request, res: Response): Promise<Response> => {
  const { notificationId, isRead } = req.body as { notificationId: string; isRead: boolean };

  try {
    const updated = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification: updated,
    });
  } catch (error) {
    console.error("updateNotification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
};

/**
 * @desc Request access to a KYC record → creates notification
 * @route POST /api/notifications/request/:uniqueId/:adress
 */
export const requestAccess = async (req: Request, res: Response) => {
  try {
    const { uniqueId, address } = req.params;

    // 1️⃣ Find user with that KYC uniqueId
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res.status(404).json({ error: "KYC record not found" });
    }

    // 2️⃣ Find the third-party app making the request
    const thirdPartyApp = await ThirdParty.findOne({ walletAddress: address });

    // 3️⃣ Create a new notification document
    const notification = new NotificationModel({
      walletAddress: user.walletAddress,
      from: thirdPartyApp?.appName || "Unknown App",
      to: uniqueId,
      type: "access_request",
      message: `Access request from ${thirdPartyApp?.appName || "Unknown App"}`,
    });

    await notification.save();

  } catch (err) {
    console.error("requestAccess error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
