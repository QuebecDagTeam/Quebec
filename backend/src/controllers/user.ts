import { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

import User from "../models/users";
import KycRecord from "../models/KYCRecord"; // Unused currently, but okay to keep if needed
import ThirdParty from "../models/thirdParty";
import NotificationModel from "../models/notify";
import { DAGKYC_ABI } from "../config/ABI";
import toto from "./auth";

dotenv.config();

const RPC = process.env.RPC_URL;
const CONTRACT_ADDRESS = (process.env.DAGKYC_ADDRESS || "").toLowerCase();
const provider = new ethers.providers.JsonRpcProvider(RPC);
const contract = new ethers.Contract(CONTRACT_ADDRESS, DAGKYC_ABI, provider);

interface AuthenticatedRequest extends Request {
  user?: any | JwtPayload;
}

/**
 * Utility to ensure wallet authorization
 */
const isAuthorized = (req: AuthenticatedRequest, targetWallet: string): boolean => {
  return req.user?.walletAddress?.toLowerCase() === targetWallet.toLowerCase();
};

/**
 * @desc Get KYC record by wallet address
 */
export const getRecordByAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const wallet = toto(req.params.walletAddress);
    if (!isAuthorized(req, wallet)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const doc = await User.findOne({ walletAddress: wallet });
    if (!doc) {
      return res.status(404).json({ error: "KYC record not found" });
    }

    return res.json({
      NIN: doc.NIN,
      email: doc.email,
      ownerAddress: doc.walletAddress,
      kycDetails: doc.kyc,
      thirdParty:doc.whitelistedThirdParties,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("getRecordByAddress error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc Delete KYC record by wallet address
 */
export const deleteKYC = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const wallet = toto(req.params.walletAddress);
    if (!isAuthorized(req, wallet)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const result = await User.findOneAndDelete({ walletAddress: wallet });
    if (!result) {
      return res.status(404).json({ message: "KYC data not found for the given wallet address" });
    }

    return res.status(200).json({ message: "KYC data successfully deleted" });
  } catch (error) {
    console.error("deleteKYC error:", error);
    return res.status(500).json({ message: "Error deleting KYC data", error });
  }
};

/**
 * @desc Get all notifications by wallet address
 */
export const getNotification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const wallet = toto(req.params.walletAddress);
    const uniqueId = req.params.uniqueId;

    if (!isAuthorized(req, wallet)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const notifications = await NotificationModel.find({ uniqueId }).sort({ createdAt: -1 });

    if (!notifications.length) {
      return res.status(404).json({ success: false, message: "No notifications found" });
    }

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("getNotification error:", error);
    return res.status(500).json({ success: false, message: "Error retrieving notifications" });
  }
};

/**
 * @desc Update notification read status
 */
export const updateNotification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { notificationId, isRead, walletAddress } = req.body;
    if (!notificationId || typeof isRead !== "boolean" || !walletAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const wallet = toto(walletAddress);
    if (!isAuthorized(req, wallet)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const updated = await NotificationModel.findByIdAndUpdate(notificationId, { isRead }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification: updated });
  } catch (error) {
    console.error("updateNotification error:", error);
    return res.status(500).json({ success: false, message: "Error updating notification" });
  }
};

/**
 * @desc Control KYC access (grant/revoke)
 */
export const controlAccess = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { uniqueId, recipient,  walletAddress, accessType } = req.body;

    if (!uniqueId || !recipient  || !walletAddress || !accessType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["granted", "revoked"].includes(accessType)) {
      return res.status(400).json({ error: "Invalid access type" });
    }

    const wallet = toto(walletAddress);
    if (!isAuthorized(req, wallet)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const userDoc = await User.findOne({ "kyc.uniqueId": uniqueId });
    if (!userDoc) return res.status(404).json({ error: "KYC record not found" });

    const now = new Date();
    let entry = userDoc.whitelistedThirdParties.find(
      (party: any) => party.kycId === uniqueId && party.thirdPartyAddress === recipient
    );
    const thirdPartyDoc = await ThirdParty.findOne({ walletAddress: recipient });

    if (entry) {
      if (entry.status === accessType) {
        return res.status(400).json({ error: `Access already ${accessType}` });
      }
      entry.status = accessType;
      entry.grantedAt = accessType === "granted" ? now : entry.grantedAt;
      entry.revokedAt = accessType === "revoked" ? now : null;
    } else {
      userDoc.whitelistedThirdParties.push({
        thirdPartyAddress: recipient,
        appName:thirdPartyDoc.appName,
        kycId: uniqueId,
        status: accessType,
        grantedAt: accessType === "granted" ? now : null,
        revokedAt: accessType === "revoked" ? now : null,
      });
    }

    await userDoc.save();

    if (thirdPartyDoc) {
      let authUser = thirdPartyDoc.authorizedUsers.find((u: any) => u.kycId === uniqueId);
      if (authUser) {
        authUser.accessStatus = accessType;
        authUser.grantedAt = accessType === "granted" ? now : authUser.grantedAt;
        authUser.revokedAt = accessType === "revoked" ? now : null;
      } else {
        thirdPartyDoc.authorizedUsers.push({
          userAddress: wallet,
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
    console.error("controlAccess error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export default deleteKYC;
