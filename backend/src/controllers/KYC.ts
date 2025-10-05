// backend/src/routes/kyc.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import { Web3Storage, File } from "web3.storage";
import KYCRecord from "../models/KYCRecord";
import {
  generateSymmetricKey,
  aesGcmEncryptHex,
  encryptSymmetricKeyForRecipient,
} from "../services/encrypt";

const router = Router();
// const upload = multer(); // Memory storage (no disk)

// Types
interface KYCRequestBody {
  walletAddress: string;
  fullName: string;
  dob: string;
  nationalId: string;
  ownerEncryptionPublicKey?: string;
}

// Web3 token
const WEB3_TOKEN: string = process.env.WEB3_STORAGE_TOKEN || "";

// Create Web3 client
function getWeb3Client(): Web3Storage {
  return new Web3Storage({ token: WEB3_TOKEN });
}
const upload = multer({ dest: 'uploads/' });

// ========================= REGISTER ROUTE =========================
export const Register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { walletAddress, fullName, dob, nationalId, ownerEncryptionPublicKey } =
      req.body as KYCRequestBody;
    const fileBuffer = (req as any).file?.buffer as Buffer | undefined;

    if (!walletAddress || !fullName || !dob || !nationalId || !fileBuffer) {
      return res.status(400).json({ message: "Missing fields or file" });
    }

    // 1) Metadata
    const meta = { fullName, dob, nationalId };
    const rawJson = JSON.stringify({ meta });

    // 2) Generate symmetric key
    const symKey: string = generateSymmetricKey();

    // 3) Encrypt JSON + image using AES-GCM
    const encryptedJson: string = aesGcmEncryptHex(rawJson, symKey);
    const encryptedImage: string = aesGcmEncryptHex(fileBuffer, symKey);

    // 4) Upload encrypted files to web3.storage
    const client = getWeb3Client();
    const files = [
      new File([Buffer.from(encryptedJson, "utf-8")], "data.json.enc"),
      new File([Buffer.from(encryptedImage, "hex")], "photo.jpg.enc"),
    ];

    const cid: string = await client.put(files);

    // 5) Hash the ciphertexts for KYC integrity
    const hash: string = crypto
      .createHash("sha256")
      .update(encryptedJson + encryptedImage)
      .digest("hex");

    // 6) Encrypt symmetric key for owner
 const encKeyForOwner: string | null = ownerEncryptionPublicKey
  ? await encryptSymmetricKeyForRecipient(symKey, ownerEncryptionPublicKey)
  : null;


    // 7) Save to MongoDB
    const record = new KYCRecord({
      walletAddress,
      cid,
      kycHash: hash,
      encryptedKeys: encKeyForOwner
        ? [{ for: walletAddress, encryptedKey: encKeyForOwner }]
        : [],
    });

    await record.save();

    // 8) Response
    return res.json({
      message: "Registered (off-chain). Call smart contract to finalize on-chain proof.",
      kycId: record._id,
      cid,
      kycHash: hash,
    });
  } catch (err: any) {
    console.error("register error", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message || err,
    });
  }
};

// ========================= VERIFY ROUTE =========================
export const Verify = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { kycId } = req.params;

    const record = await KYCRecord.findById(kycId);
    if (!record) {
      return res.status(404).json({ message: "KYC not found" });
    }

    return res.json({
      walletAddress: record.walletAddress,
      verified: true,
      kycHash: record.kycHash,
    });
  } catch (error: any) {
    console.error("Verify error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || error,
    });
  }
};


