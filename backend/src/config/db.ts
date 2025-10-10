import mongoose from "mongoose";
import { ENV } from "./env";

// const MONGO_URI = process.env.MONGO_URI as string || '';

export const ConnectDB = async () =>{
    try {
        const connect = await mongoose.connect(ENV.DB_URI);
            console.log("MongoDB connected");
    } catch (error) {
        console.error("Mongo connection error:", error)
    }
}

