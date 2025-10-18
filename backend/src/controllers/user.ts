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
import toto from "./auth";

const RPC = process.env.RPC_URL;
const CONTRACT_ADDRESS = (process.env.DAGKYC_ADDRESS || "").toLowerCase();
const provider = new ethers.providers.JsonRpcProvider(RPC);
const contract = new ethers.Contract(CONTRACT_ADDRESS, DAGKYC_ABI, provider);


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


 

export const controlAccess = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { uniqueId, recipient, txHash, ownerAddress, accessType } = req.body;

    // Validate input
    if (!uniqueId || !recipient || !txHash || !ownerAddress || !accessType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["granted", "revoked"].includes(accessType)) {
      return res.status(400).json({ error: "Invalid access type. Must be 'granted' or 'revoked'." });
    }

    // Find user by uniqueId
    const userDoc = await User.findOne({ "kyc.uniqueId": uniqueId });
    if (!userDoc) return res.status(404).json({ error: "KYC record not found" });

    // Find or update whitelisted third party
    let entry = userDoc.whitelistedThirdParties.find(
      (party: any) =>
        party.kycId === uniqueId && party.thirdPartyAddress === recipient
    );

    const now = new Date();

    if (entry) {
      // Already granted and trying to re-grant
      if (entry.status === "granted" && accessType === "granted") {
        return res.status(400).json({ error: "Access already granted" });
      }

      // Already revoked and trying to re-revoke
      if (entry.status === "revoked" && accessType === "revoked") {
        return res.status(400).json({ error: "Access already revoked" });
      }

      entry.status = accessType;
      entry.grantedAt = accessType === "granted" ? now : entry.grantedAt;
      entry.revokedAt = accessType === "revoked" ? now : null;
    } else {
      userDoc.whitelistedThirdParties.push({
        thirdPartyAddress: recipient,
        kycId: uniqueId,
        status: accessType,
        grantedAt: accessType === "granted" ? now : null,
        revokedAt: accessType === "revoked" ? now : null,
      });
    }

    userDoc.kyc.transactionHash = txHash;
    await userDoc.save();

    // Update authorized users in ThirdParty
    const thirdPartyDoc = await ThirdParty.findOne({ walletAddress: recipient });

    if (thirdPartyDoc) {
      let authUser = thirdPartyDoc.authorizedUsers.find(
        (u: any) => u.kycId === Number(uniqueId)
      );

      if (authUser) {
        authUser.accessStatus = accessType;
        authUser.grantedAt = accessType === "granted" ? now : authUser.grantedAt;
        authUser.revokedAt = accessType === "revoked" ? now : null;
      } else {
        thirdPartyDoc.authorizedUsers.push({
          userAddress: ownerAddress,
          kycId: Number(uniqueId),
          accessStatus: accessType,
          grantedAt: accessType === "granted" ? now : null,
          revokedAt: accessType === "revoked" ? now : null,
        });
      }

      await thirdPartyDoc.save();
    }

    return res.json({ success: true, access: accessType });
  } catch (err) {
    console.error("userAccess error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

  