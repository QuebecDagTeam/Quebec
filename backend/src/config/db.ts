import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string || '';

export const ConnectDB = async () =>{
    try {
        const connect = await mongoose.connect(MONGO_URI);
            console.log("MongoDB connected");
    } catch (error) {
        console.error("Mongo connection error:", error)
    }
}

