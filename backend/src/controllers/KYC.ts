import { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/users";  // Updated model import based on the new schema
import KycRecord from "../models/KYCRecord";  // Assuming you have the KYCRecord model
import { DAGKYC_ABI } from "../config/ABI";
import users from "../models/users";
import thirdParty from "../models/thirdParty";

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
export const grantAccess = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Destructure request body
    const { uniqueId, recipient, txHash, ownerAddress } = req.body;

    // Validate required fields
    if (!uniqueId || !recipient || !txHash || !ownerAddress) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Find user document by uniqueId
    const userDoc = await User.findOne({ 'kyc.uniqueId': uniqueId });
    if (!userDoc) return res.status(404).json({ error: 'KYC record not found' });

    // Check if recipient is already whitelisted and has access granted
    const existingEntry = userDoc.whitelistedThirdParties.find(
      (party:any) => party.kycId === uniqueId && party.thirdPartyAddress === recipient
    );

    if (existingEntry) {
      if (existingEntry.status === 'granted') {
        return res.status(400).json({ error: 'Access already granted' });
      }

      // Update status and grantedAt timestamp if revoked
      existingEntry.status = 'granted';
      existingEntry.grantedAt = new Date();
      existingEntry.revokedAt = null;
    } else {
      // If no existing entry, create a new one
      userDoc.whitelistedThirdParties.push({
        thirdPartyAddress: recipient,
        kycId: uniqueId,
        status: 'granted',
        grantedAt: new Date(),
      });
    }

    // Push the access event to the history (for logging purposes)
    userDoc.kyc.transactionHash = txHash;

    // Save the document
    await userDoc.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('grantAccess error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Revoke access
export const revokeAccess = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { uniqueId, recipient, txHash, ownerAddress } = req.body;

    // Validate required fields
    if (!uniqueId || !recipient || !txHash || !ownerAddress) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Find user document by uniqueId
    const userDoc = await User.findOne({ 'kyc.uniqueId': uniqueId });
    if (!userDoc) return res.status(404).json({ error: 'KYC record not found' });

    // Find the recipient in the whitelistedThirdParties array
    const existingEntry = userDoc.whitelistedThirdParties.find(
      (party:any) => party.kycId === uniqueId && party.thirdPartyAddress === recipient
    );

    if (!existingEntry || existingEntry.status === 'revoked') {
      return res.status(400).json({ error: 'Access is already revoked or never granted' });
    }

    // Update the status to revoked and set the revokedAt timestamp
    existingEntry.status = 'revoked';
    existingEntry.revokedAt = new Date();

    // Push the access revocation event to the history (for logging purposes)
    userDoc.kyc.transactionHash = txHash;

    // Save the document
    await userDoc.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('revokeAccess error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


/**
 * GET /api/kyc/record/:uniqueId
 * Returns KYC record by uniqueId
 */
export const getRecordByUniqueId = async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.params;
    const doc = await User.findOne({ uniqueId });
    if (!doc) return res.status(404).json({ error: "KYC record not found" });

    return res.json({
      ownerAddress: doc.walletAddress,
      kycId: doc.uniqueId,
      encryptedData: doc.encryptedData,
      encryptedSymKeys: doc.encryptedSymKeys,
      accessHistory: doc.accessHistory,
      status: doc.status,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("getRecordByUniqueId error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getRecordByAddress = async (req: Request, res: Response) => {
  try {
    const { walletAdress } = req.params;
    const doc = await User.findOne({ walletAdress });
    if (!doc) return res.status(404).json({ error: "KYC record not found" });

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
    const existingUser = await thirdParty.findOne({ walletAddress });
    if (existingUser) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Save the new KYC record to the database
    const newKyc = new thirdParty({
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
    const doc = await thirdParty.findOne({ walletAdress });
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
    const user = await thirdParty.findOne({ walletAddress: wallet });

    return res.json({ registered: !!user });
  } catch (err) {
    console.error("isWalletRegistered error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
