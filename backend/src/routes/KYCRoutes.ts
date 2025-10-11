// routes/kycRoutes.ts
import express from "express";
import {
  getRecordByAddress,
  isWalletRegistered,
  Register
} from "../controllers/KYC";

const router = express.Router();
router.post("/register", Register);
router.get("/isRegistered/:walletAddress", isWalletRegistered);
router.get('/user/:walletAddress', getRecordByAddress);
export default router;
