// models/KycRecord.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IKycRecord extends Document {
  ownerAddress: string;           // wallet address
  kycId: number;                  // on-chain id
  encryptedDataHash: string;      // pointer to encrypted data (IPFS CID)
  txHash: string;                 // tx that created/updated KYC
  encryptedSymKeys: { [address: string]: string }; // recipientAddress -> encryptedSymKey (hex/base64)
  status: "pending" | "confirmed" | "revoked";
  createdAt: Date;
  updatedAt: Date;
}

const KycRecordSchema = new Schema<IKycRecord>({
  ownerAddress: { type: String, required: true, index: true },
  kycId: { type: Number, required: true, index: true, unique: true },
  encryptedDataHash: { type: String, required: true },
  txHash: { type: String, required: true },
  encryptedSymKeys: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ["pending", "confirmed", "revoked"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.KycRecord || mongoose.model<IKycRecord>("KycRecord", KycRecordSchema);
