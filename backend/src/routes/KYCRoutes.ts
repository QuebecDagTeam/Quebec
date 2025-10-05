import express from "express"
import {Register, Verify} 
from "../controllers/KYC"
import multer from "multer";

const KYCRoute = express.Router()
const upload = multer(); // Memory storage (no disk)

KYCRoute.post("/register", upload.single("image"), Register);
KYCRoute.get("/verify/:kycId", Verify);

export default KYCRoute