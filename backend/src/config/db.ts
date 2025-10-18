import mongoose from "mongoose";
import { ENV } from "./env";

export const ConnectDB = async (shouldDrop: boolean = false) => {
  try {
    await mongoose.connect(ENV.DB_URI);
    console.log("✅ MongoDB connected");

    if (shouldDrop) {
    //   await mongoose.connection.dropDatabase();
    //   console.log("⚠️ Database dropped successfully!");
    }
  } catch (error) {
    console.error("❌ Mongo connection error:", error);
  }
};
