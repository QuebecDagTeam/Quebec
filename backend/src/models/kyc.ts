import mongoose, { Schema, Document } from "mongoose";

export interface IKYC extends Document {
  walletAddress: string;
  encryptedData: string;
  uniqueId:string;
  transactionHash: string;
  userType: "user" | "thirdParty";
  timestamp: Date;
}

/**
 * KYC Schema
 * Stores only encrypted KYC data and transaction info.
 * No decrypted personal info is ever stored in the database.
 */
const KYCSchema: Schema = new Schema<IKYC>({
  walletAddress: {
    type: String,
    required: true,
    index: true,
  },
  uniqueId:{
 type: String,
    required: true,
    index: true,
  },
  encryptedData: {
    type: String,
    required: true,
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true,
  },
  userType: {
    type: String,
    enum: ["user", "thirdParty"],
    default: "user",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IKYC>("KYC", KYCSchema);
