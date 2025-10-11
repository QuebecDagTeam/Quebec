// routes/kycRoutes.ts
import express from "express";
import deleteKYC, {
  getRecordByAddress,
  grantAccess,
  isWalletRegistered,
  Register,
  revokeAccess
} from "../controllers/KYC";

const router = express.Router();
router.post("/register", Register);
router.get("/isRegistered/:walletAddress", isWalletRegistered);
router.get('/user/:walletAddress', getRecordByAddress);
router.get('/user/grant-access/:walletAddress', grantAccess);
router.get('/user/revoke-access/:walletAddress', revokeAccess);
router.delete('/delete-user/:walletAddress', deleteKYC);
export default router;
