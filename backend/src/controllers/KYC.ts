import { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/users";  // Updated model import based on the new schema
import KycRecord from "../models/KYCRecord";  // Assuming you have the KYCRecord model
import { DAGKYC_ABI } from "../config/ABI";

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

/**
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
    const newKYC = new KycRecord({
      walletAddress: toto(walletAddress),
      encryptedData,
      transactionHash,
      uniqueId,
      timestamp: new Date(),
    });

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
    await newKYC.save();
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
export const grantAccess = async (req: Request, res: Response) => {
  try {
    const { ownerAddress, kycId, recipient, txHash, recipientEncryptedSymKey } = req.body;

    if (!ownerAddress || !kycId || !recipient || !txHash || !recipientEncryptedSymKey) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || !receipt.blockNumber) return res.status(400).json({ error: "Transaction not mined" });

    const iface = new ethers.utils.Interface(DAGKYC_ABI);
    let verified = false;

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== CONTRACT_ADDRESS) continue;
      try {
        const parsed = iface.parseLog(log);
        if (parsed.name === "AccessGranted") {
          const parsedOwner = parsed.args[0];
          const parsedRecipient = parsed.args[1];
          const parsedKycId = Number(parsed.args[2].toString());

          if (
            parsedOwner.toLowerCase() === ownerAddress.toLowerCase() &&
            parsedRecipient.toLowerCase() === recipient.toLowerCase() &&
            parsedKycId === Number(kycId)
          ) {
            verified = true;
            break;
          }
        }
      } catch {}
    }

    if (!verified) return res.status(400).json({ error: "Could not verify on-chain grant" });

    const doc = await KycRecord.findOne({ kycId });
    if (!doc) return res.status(404).json({ error: "KYC record not found" });

    doc.encryptedSymKeys[toto(recipient)] = recipientEncryptedSymKey;
    doc.accessHistory.push({ recipient: toto(recipient), action: "granted", timestamp: new Date() });
    await doc.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("grantAccess error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/kyc/revoke
 * Body: { ownerAddress, kycId, recipient, txHash }
 * Revokes access to encrypted KYC data for a third-party recipient
 */
export const revokeAccess = async (req: Request, res: Response) => {
  try {
    const { ownerAddress, kycId, recipient, txHash } = req.body;

    if (!ownerAddress || !kycId || !recipient || !txHash) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || !receipt.blockNumber) return res.status(400).json({ error: "Transaction not mined" });

    const iface = new ethers.utils.Interface(DAGKYC_ABI);
    let verified = false;

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== CONTRACT_ADDRESS) continue;
      try {
        const parsed = iface.parseLog(log);
        if (parsed.name === "AccessRevoked") {
          const parsedOwner = parsed.args[0];
          const parsedRecipient = parsed.args[1];
          const parsedKycId = Number(parsed.args[2].toString());

          if (
            parsedOwner.toLowerCase() === ownerAddress.toLowerCase() &&
            parsedRecipient.toLowerCase() === recipient.toLowerCase() &&
            parsedKycId === Number(kycId)
          ) {
            verified = true;
            break;
          }
        }
      } catch {}
    }

    if (!verified) return res.status(400).json({ error: "Could not verify on-chain revoke" });

    const doc = await KycRecord.findOne({ kycId });
    if (!doc) return res.status(404).json({ error: "KYC record not found" });

    delete doc.encryptedSymKeys[toto(recipient)];
    doc.accessHistory.push({ recipient: toto(recipient), action: "revoked", timestamp: new Date() });
    await doc.save();

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
export const getRecordByUniqueId = async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.params;
    const doc = await KycRecord.findOne({ uniqueId });
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
    const doc = await KycRecord.findOne({ walletAdress:toto(walletAdress) });
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

