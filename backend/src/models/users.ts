import mongoose, { Document, Schema } from "mongoose";

// User Interface
export interface IUser extends Document {
  walletAddress: string;
  email?: string;
  ID:{
    type:string;
    number:any
  }
  kyc: {
    encryptedData: string;
    uniqueId: string;
    transactionHash: string;
    userType: "user" | "thirdParty";
    timestamp: Date;
  };
  password:string;
  whitelistedThirdParties: Array<{
    thirdPartyAddress: string;
    kycId: string; // KYC unique ID that the third party has access to
    status: "granted" | "revoked";
    grantedAt?: Date;
    revokedAt?: Date | null;
  }>;
  appName:string;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema with embedded KYC details
const UserSchema = new Schema<IUser>(
  {
    walletAddress: { type: String, required: true, index: true, unique: true },
    ID:{
      type:{ type: String, required: true },
      number:{ type: String, required: true }
    },
    email: { type: String },
    kyc: {
      encryptedData: { type: String, required: true },
      uniqueId: { type: String, required: true, index: true },
      transactionHash: { type: String, required: true, unique: true },
      userType: { type: String, enum: ["user", "thirdParty"], default: "user" },
      timestamp: { type: Date, default: Date.now },
    },
    password:{ type: String, required: true },
    whitelistedThirdParties: [
      {
        thirdPartyAddress: { type: String, required: true },
        appName:{type: String, required: true },
        kycId: { type: String, required: true }, // Reference to KYC unique ID
        status: { type: String, enum: ["granted", "revoked"], required: true },
        grantedAt: { type: Date },
        revokedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);





