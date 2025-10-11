// routes/kycRoutes.ts
import express from "express";
import {
  isWalletRegistered,
  Register
} from "../controllers/KYC";

const router = express.Router();
router.post("/register", Register);
router.get("/isRegistered/:walletAddress", isWalletRegistered);
export default router;
