// models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  fullName?: string;
  email?: string;
  kycIds: number[]; // list of on-chain kyc ids owned by user
  whitelistedThirdParties: Array<{
    thirdPartyAddress: string;
    kycId: number;
    status: "granted" | "revoked";
    grantedAt?: Date;
    revokedAt?: Date | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  walletAddress: { type: String, required: true, index: true, unique: true },
  fullName: { type: String },
  email: { type: String },
  kycIds: { type: [Number], default: [] },
  whitelistedThirdParties: { type: Schema.Types.Mixed, default: [] },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
