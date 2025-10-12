// routes/kycRoutes.ts
import express from "express";
import deleteKYC, {
  getRecordByAddress,
  grantAccess,
  isWalletRegistered,
  Register,
  revokeAccess,
  getThirdPartyRecord,
  isRegistered_thirdParty
} from "../controllers/KYC";

const router = express.Router();
router.post("/register", Register);
router.get("/isRegistered/:walletAddress", isWalletRegistered);
router.get('/user/:walletAddress', getRecordByAddress);
router.post('/user/grant-access/:walletAddress', grantAccess);
router.post('/user/revoke-access/:walletAddress', revokeAccess);
router.delete('/delete-user/:walletAddress', deleteKYC);
router.post("/register_thirdParty", Register);
router.get("/isRegistered_thirdParty/:walletAddress", isRegistered_thirdParty);
router.get('/thirdParty/:walletAddress', getThirdPartyRecord);
export default router;
