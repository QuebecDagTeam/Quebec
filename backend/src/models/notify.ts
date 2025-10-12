import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  walletAddress: string;
  to: string;
  from: string;
  type: "access_request" | "grant" | "revoke";
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    walletAddress: { type: String, required: true, index: true },
    to: { type: String, required: true },
    from: { type: String, required: true },
    type: {
      type: String,
      enum: ["access_request", "grant", "revoke"],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("NotificationModel", notificationSchema);
