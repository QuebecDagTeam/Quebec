import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import KYCRoute from "./routes/KYCRoutes";
import {ConnectDB} from "./config/db"
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

ConnectDB()

// // Routes
app.use("/api/kyc", KYCRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
