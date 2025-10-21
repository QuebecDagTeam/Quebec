import { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import bcrypt from "bcrypt"
dotenv.config();

import User from "../models/users";  // Updated model import based on the new schema
import KycRecord from "../models/KYCRecord";  // Assuming you have the KYCRecord model
import { DAGKYC_ABI } from "../config/ABI";
import users from "../models/users";
import ThirdParty from "../models/thirdParty";
import NotificationModel from "../models/notify";

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
  



export const requestAccess = async (req: Request, res: Response) => {
  try {
    const { address } = req.params; // The third-party’s wallet address (who is requesting)
    const { uniqueId } = req.body; // The user's unique KYC ID

    if (!uniqueId) {
      return res.status(400).json({ error: "uniqueId is required" });
    }

    // 1️⃣ Find the user with that KYC uniqueId
    const user = await User.findOne({ "kyc.uniqueId": uniqueId }); // ✅ correct path
    if (!user) {
      return res.status(404).json({ error: "KYC record not found" });
    }

    // 2️⃣ Find the third-party app making the request
    const thirdPartyApp = await ThirdParty.findOne({ walletAddress: address });
    // if (!thirdPartyApp) {
    //   return res.status(404).json({ error: "Third-party app not found" });
    // }

    // 3️⃣ Create a new notification document
    const notification = new NotificationModel({
      walletAddress: user.walletAddress, // target user (the data owner)
      from: thirdPartyApp.walletAddress, // requester’s wallet address
      to: user.walletAddress,
      uniqueId,
      type: "access_request",
      message: `Access request from ${thirdPartyApp.appName || "Unknown App"}`,
      isRead: false,
    });

    await notification.save();

    return res.status(201).json({
      success: true,
      message: "Access request sent successfully",
      notification,
    });
  } catch (err) {
    console.error("requestAccess error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
