// controllers/kycController.ts
import { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import KycRecord from "../models/KYCRecord";
import User from "../models/users";
import ThirdParty from "../models/thirdParty";
import {DAGKYC_ABI} from "../config/ABI";

const RPC = process.env.RPC_URL
const CONTRACT_ADDRESS = (process.env.DAGKYC_ADDRESS || "").toLowerCase();
const provider = new ethers.providers.JsonRpcProvider(RPC);
const contract = new ethers.Contract(CONTRACT_ADDRESS, DAGKYC_ABI, provider);

function toChecksum(addr: string) {
  try { return ethers.utils.getAddress(addr); } catch { return addr.toLowerCase(); }
}

/**
 * POST /api/kyc/onchain-callback
 * body: { ownerAddress, kycId, txHash, encryptedDataHash, ownerEncryptedSymKey? }
 * Verifies on-chain event KycRegistered and saves KycRecord + User if needed.
 */

import KYCSchema from "../models/kyc";
import { generateUniqueId } from "../services/uniqueId";

export const Register = async (req: Request, res: Response) => {
  try {
    const { walletAddress, encryptedData, transactionHash } = req.body;

    const newKYC = new KYCSchema({
      walletAddress,
      encryptedData,
      transactionHash,
      timestamp: new Date(),
    });

    await newKYC.save();
    res.status(200).json({ message: "KYC stored successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving KYC" });
  }
};
/**
 * GET /api/kyc/is-registered/:walletAddress
 * Returns { registered: true | false }
 */

export const isWalletRegistered = async (req: Request, res: Response) => {
  try {
    const wallet = toChecksum(req.params.walletAddress);
    const user = await KYCSchema.findOne({ walletAddress: wallet });

    return res.json({ registered: !!user });
  } catch (err) {
    console.error("isWalletRegistered err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
/**
 * POST /api/kyc/grant
 * Body: { ownerAddress, kycId, recipient, txHash, recipientEncryptedSymKey }
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

    doc.encryptedSymKeys[toChecksum(recipient)] = recipientEncryptedSymKey;
    doc.accessHistory.push({ recipient: toChecksum(recipient), action: "granted", timestamp: new Date() });
    await doc.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("grantAccess err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
/**
 * POST /api/kyc/revoke
 * Body: { ownerAddress, kycId, recipient, txHash }
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

    delete doc.encryptedSymKeys[toChecksum(recipient)];
    doc.accessHistory.push({ recipient: toChecksum(recipient), action: "revoked", timestamp: new Date() });
    await doc.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("revokeAccess err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};



/**
 * GET /api/kyc/record/:uniqueId
 */
export const getRecordByUniqueId = async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.params;
    const doc = await KycRecord.findOne({ uniqueId });
    if (!doc) return res.status(404).json({ error: "KYC record not found" });

    return res.json({
      ownerAddress: doc.ownerAddress,
      kycId: doc.kycId,
      encryptedDataHash: doc.encryptedDataHash,
      encryptedSymKeys: doc.encryptedSymKeys,
      accessHistory: doc.accessHistory,
      status: doc.status,
      createdAt: doc.createdAt
    });
  } catch (err) {
    console.error("getRecordByUniqueId err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/thirdparty/dashboard/:walletAddress
//  */
// export const getThirdPartyFullAccessInfo = async (req: Request, res: Response) => {
//   try {
//     const wallet = toChecksum(req.params.walletAddress);

//     const grantedRecords = await KycRecord.find({
//       [`encryptedSymKeys.${wallet}`]: { $exists: true }
//     });

//     const revokedRecords = await KycRecord.find({
//       accessHistory: {
//         $elemMatch: {
//           recipient: wallet,
//           action: "revoked"
//         }
//       }
//     });

//     const historyRecords = await KycRecord.find({
//       accessHistory: {
//         $elemMatch: { recipient: wallet }
//       }
//     });

//     return res.json({
//       walletAddress: wallet,
//       granted: grantedRecords.map(r => ({ uniqueId: r.uniqueId, kycId: r.kycId })),
//       revoked: revokedRecords.map(r => ({ uniqueId: r.uniqueId, kycId: r.kycId })),
//       fullAccessHistory: historyRecords.map(r => ({
//         uniqueId: r.uniqueId,
//         kycId: r.kycId,
//         history: r.accessHistory.filter(h => h.recipient === wallet)
//       }))
//     });
//   } catch (err) {
//     console.error("getThirdPartyFullAccessInfo err:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };
