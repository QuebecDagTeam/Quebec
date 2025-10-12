// models/ThirdParty.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IThirdParty extends Document {
  walletAddress: string;
  appName: string;
  description?: string;
  wesite?: string;
  detail?: string;
  authorizedUsers: Array<{
    userAddress: string;
    kycId: number;
    accessStatus: "granted" | "revoked";
    grantedAt?: Date;
    revokedAt?: Date | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ThirdPartySchema = new Schema<IThirdParty>({
  walletAddress: { type: String, required: true, index: true, unique: true },
  appName: { type: String, required: true },
  description: { type: String },
  wesite: { type: String },
  detail: { type: String },
  authorizedUsers: { type: Schema.Types.Mixed, default: [] },
}, { timestamps: true });

export default mongoose.models.ThirdParty || mongoose.model<IThirdParty>("ThirdParty", ThirdPartySchema);
