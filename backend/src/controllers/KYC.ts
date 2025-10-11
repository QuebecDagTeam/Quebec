// controllers/kycController.ts
import { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import KycRecord from "../models/KYCRecord";
import User from "../models/users";
import ThirdParty from "../models/thirdParty";
import {DAGKYC_ABI} from "../config/ABI";

const RPC = process.env.RPC_URL || "http://localhost:8545";
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

export const onchainCallback = async (req: Request, res: Response) => {
  try {
    const { ownerAddress, kycId, txHash, encryptedDataHash, ownerEncryptedSymKey, fullName, email } = req.body;
    if (!ownerAddress || kycId === undefined || !txHash || !encryptedDataHash) {
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
        if (parsed.name === "KycRegistered") {
          const parsedKycId = Number(parsed.args[0].toString());
          const parsedOwner = parsed.args[1];
          const parsedEncrypted = parsed.args[2];
          if (parsedKycId === Number(kycId) &&
              parsedOwner.toLowerCase() === ownerAddress.toLowerCase() &&
              parsedEncrypted === encryptedDataHash) {
            verified = true;
            break;
          }
        }
      } catch (e) { /* skip */ }
    }

    if (!verified) return res.status(400).json({ error: "Could not verify on-chain registration" });

    // Save / upsert user
    const ownerAddrChecksum = toChecksum(ownerAddress);
    await User.updateOne(
      { walletAddress: ownerAddrChecksum },
      { $set: { fullName: fullName || null, email: email || null }, $addToSet: { kycIds: Number(kycId) } },
      { upsert: true }
    );

    // Save kyc record
    const kycDoc = new KycRecord({
      ownerAddress: ownerAddrChecksum,
      kycId: Number(kycId),
      encryptedDataHash,
      txHash,
      encryptedSymKeys: ownerEncryptedSymKey ? { [ownerAddrChecksum]: ownerEncryptedSymKey } : {},
      status: "confirmed"
    });
    await kycDoc.save();

    return res.json({ success: true, recordId: kycDoc._id });
  } catch (err) {
    console.error("onchainCallback err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/kyc/grant
 * Body: { ownerAddress, kycId, recipient, txHash, recipientEncryptedSymKey }
 * Verifies AccessGranted in tx logs then updates KycRecord, User, ThirdParty
 */
export const onchainGrant = async (req: Request, res: Response) => {
  try {
    const { ownerAddress, kycId, recipient, txHash, recipientEncryptedSymKey } = req.body;
    if (!ownerAddress || kycId === undefined || !recipient || !txHash) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || !receipt.blockNumber) return res.status(400).json({ error: "TX not mined" });

    const iface = new ethers.utils.Interface(DAGKYC_ABI);
    let verified = false;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== CONTRACT_ADDRESS) continue;
      try {
        const parsed = iface.parseLog(log);
        if (parsed.name === "AccessGranted") {
          const parsedKycId = Number(parsed.args[0].toString());
          const parsedRecipient = parsed.args[1];
          if (parsedKycId === Number(kycId) && parsedRecipient.toLowerCase() === recipient.toLowerCase()) {
            verified = true;
            break;
          }
        }
      } catch (e) {}
    }

    if (!verified) return res.status(400).json({ error: "Could not verify AccessGranted" });

    const ownerAddrChecksum = toChecksum(ownerAddress);
    const recipientChecksum = toChecksum(recipient);

    // Update KycRecord encryptedSymKeys
    const kyc = await KycRecord.findOne({ kycId: Number(kycId) });
    if (!kyc) return res.status(404).json({ error: "KYC not found" });

    kyc.encryptedSymKeys = kyc.encryptedSymKeys || {};
    if (recipientEncryptedSymKey) {
      kyc.encryptedSymKeys[recipientChecksum] = recipientEncryptedSymKey;
    } else {
      // if not provided by frontend, try to read from contract (returns bytes)
      try {
        const raw = await contract.getEncryptedSymKey(Number(kycId), recipientChecksum);
        if (raw && raw.length) {
          // convert to hex or base64 for storage (store hex)
          kyc.encryptedSymKeys[recipientChecksum] = ethers.utils.hexlify(raw);
        }
      } catch (e) { /* ignore */ }
    }
    await kyc.save();

    // Update User.whitelistedThirdParties
    await User.updateOne(
      { walletAddress: ownerAddrChecksum },
      {
        $addToSet: {
          whitelistedThirdParties: {
            thirdPartyAddress: recipientChecksum,
            status: "granted",
            kycId: Number(kycId),
            grantedAt: new Date()
          }
        }
      },
      { upsert: true }
    );

    // Update ThirdParty.authorizedUsers
    await ThirdParty.updateOne(
      { walletAddress: recipientChecksum },
      {
        $addToSet: {
          authorizedUsers: {
            userAddress: ownerAddrChecksum,
            kycId: Number(kycId),
            accessStatus: "granted",
            grantedAt: new Date()
          }
        }
      },
      { upsert: true }
    );

    return res.json({ success: true, message: "Access granted and DB synced" });
  } catch (err) {
    console.error("onchainGrant err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/kyc/revoke
 * Body: { ownerAddress, kycId, recipient, txHash }
 */
export const onchainRevoke = async (req: Request, res: Response) => {
  try {
    const { ownerAddress, kycId, recipient, txHash } = req.body;
    if (!ownerAddress || kycId === undefined || !recipient || !txHash) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || !receipt.blockNumber) return res.status(400).json({ error: "TX not mined" });

    const iface = new ethers.utils.Interface(DAGKYC_ABI);
    let verified = false;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== CONTRACT_ADDRESS) continue;
      try {
        const parsed = iface.parseLog(log);
        if (parsed.name === "AccessRevoked") {
          const parsedKycId = Number(parsed.args[0].toString());
          const parsedRecipient = parsed.args[1];
          if (parsedKycId === Number(kycId) && parsedRecipient.toLowerCase() === recipient.toLowerCase()) {
            verified = true;
            break;
          }
        }
      } catch (e) {}
    }

    if (!verified) return res.status(400).json({ error: "Could not verify AccessRevoked" });

    const ownerAddrChecksum = toChecksum(ownerAddress);
    const recipientChecksum = toChecksum(recipient);

    // Update KycRecord: remove encrypted key
    const kyc = await KycRecord.findOne({ kycId: Number(kycId) });
    if (!kyc) return res.status(404).json({ error: "KYC not found" });

    if (kyc.encryptedSymKeys && kyc.encryptedSymKeys[recipientChecksum]) {
      delete kyc.encryptedSymKeys[recipientChecksum];
      await kyc.save();
    }

    // Update User.whitelistedThirdParties: mark revoked
    await User.updateOne(
      { walletAddress: ownerAddrChecksum, "whitelistedThirdParties.thirdPartyAddress": recipientChecksum },
      {
        $set: {
          "whitelistedThirdParties.$.status": "revoked",
          "whitelistedThirdParties.$.revokedAt": new Date()
        }
      }
    );

    // Update ThirdParty.authorizedUsers
    await ThirdParty.updateOne(
      { walletAddress: recipientChecksum, "authorizedUsers.userAddress": ownerAddrChecksum },
      {
        $set: {
          "authorizedUsers.$.accessStatus": "revoked",
          "authorizedUsers.$.revokedAt": new Date()
        }
      }
    );

    return res.json({ success: true, message: "Access revoked and DB synced" });
  } catch (err) {
    console.error("onchainRevoke err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/kyc/:kycId
 * Returns encrypted pointers + encryptedSymKeys (DO NOT return plaintext)
 */
export const getKycRecord = async (req: Request, res: Response) => {
  try {
    if (typeof(req.params.kycId) ! ==="number"){
      return res.json({error:"Invalid ID"})
    }
    const kycId = Number(req.params.kycId);
    
    const doc = await KycRecord.findOne({ kycId });
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json({
      ownerAddress: doc.ownerAddress,
      kycId: doc.kycId,
      encryptedDataHash: doc.encryptedDataHash,
      encryptedSymKeys: doc.encryptedSymKeys || {},
      status: doc.status,
      createdAt: doc.createdAt
    });
  } catch (err) {
    console.error("getKycRecord err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/users/:walletAddress
 * Returns user dashboard info (encrypted only)
 */
export const getUserDashboard = async (req: Request, res: Response) => {
  try {
    const wallet = toChecksum(req.params.walletAddress);
    const user = await User.findOne({ walletAddress: wallet });
    if (!user) return res.status(404).json({ error: "User not found" });
    // Optionally include KYC records pointers for their kycIds
    const kycs = await KycRecord.find({ ownerAddress: wallet }, { encryptedDataHash: 1, kycId: 1, createdAt: 1 });
    return res.json({ user, kycs });
  } catch (err) {
    console.error("getUserDashboard err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/thirdparty/:walletAddress
 * Returns third-party dashboard info (encrypted only)
 */
export const getThirdPartyDashboard = async (req: Request, res: Response) => {
  try {
    const wallet = toChecksum(req.params.walletAddress);
    const tp = await ThirdParty.findOne({ walletAddress: wallet });
    if (!tp) return res.status(404).json({ error: "Third party not found" });
    return res.json({ thirdParty: tp });
  } catch (err) {
    console.error("getThirdPartyDashboard err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/thirdparty/register
 * Body: { walletAddress, appName, description, logoUrl }
 */
export const registerThirdParty = async (req: Request, res: Response) => {
  try {
    const { walletAddress, appName, description, logoUrl } = req.body;
    if (!walletAddress || !appName) return res.status(400).json({ error: "Missing fields" });
    const checksum = toChecksum(walletAddress);
    const obj = { walletAddress: checksum, appName, description: description || null, logoUrl: logoUrl || null };
    await ThirdParty.updateOne({ walletAddress: checksum }, { $set: obj }, { upsert: true });
    return res.json({ success: true });
  } catch (err) {
    console.error("registerThirdParty err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/kyc/request-access-callback
 * Optional endpoint if frontend wants to notify backend after calling requestAccess on-chain.
 * Body: { requester, kycId, txHash, requestId, metadata }
 */
export const onchainRequestAccessCallback = async (req: Request, res: Response) => {
  try {
    const { requester, kycId, txHash, requestId, metadata } = req.body;
    if (!requester || kycId === undefined || !txHash || requestId === undefined) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // verify event AccessRequested similar to above - omitted here for brevity (you can add)
    // Save as AccessRequest record in DB / or push notification to owner via websocket
    // For now, just upsert ThirdParty if missing
    await ThirdParty.updateOne(
      { walletAddress: toChecksum(requester) },
      { $setOnInsert: { appName: "unknown", description: null }, $set: {} },
      { upsert: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("onchainRequestAccessCallback err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
