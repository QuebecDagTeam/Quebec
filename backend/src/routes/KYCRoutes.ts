// routes/kycRoutes.ts
import express from "express";
import {
  onchainCallback,
  onchainGrant,
  onchainRevoke,
  getKycRecord,
  getUserDashboard,
  getThirdPartyDashboard,
  registerThirdParty,
  onchainRequestAccessCallback,
  Register
} from "../controllers/KYC";

const router = express.Router();

router.post("/onchain-callback", onchainCallback);
router.post("/grant", onchainGrant);
router.post("/revoke", onchainRevoke);
router.get("/:kycId", getKycRecord);
router.post("/register", Register);
router.get("/user/:walletAddress", getUserDashboard);
router.get("/thirdparty/:walletAddress", getThirdPartyDashboard);

router.post("/thirdparty/register", registerThirdParty);
router.post("/request-access-callback", onchainRequestAccessCallback);

export default router;
