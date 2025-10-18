import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import {ConnectDB} from "./config/db"
import UserRoute from "./routes/users";
import ThirdPartyRoute from "./routes/thirdPart";
import AuthRoute from "./routes/auth";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

ConnectDB(true)

app.use("/api/kyc/user", UserRoute);
app.use("/api/kyc/thirdPrty", ThirdPartyRoute);
app.use("/api/kyc/auth", AuthRoute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
