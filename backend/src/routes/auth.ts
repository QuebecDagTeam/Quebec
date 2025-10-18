// routes/kycRoutes.ts
import express from "express";
import deleteKYC, {
  Register,
  Login,
  isRegistered_thirdParty,
  ThirdPartyReg,
  isWalletRegistered,
  isNINRegistered,
  isEmailRegistered
} from "../controllers/auth";

const AuthRoute = express.Router();
AuthRoute.post("/register", Register)
.delete('/delete-user/:walletAddress', deleteKYC)
.post("/register_thirdparty", ThirdPartyReg)
.get("/isRegistered_thirdParty/:walletAddress", isRegistered_thirdParty)
.post("/login", Register)
.get("/isRegistered/:walletAddress", isWalletRegistered)
.get("/isNIN/:walletAddress", isNINRegistered)
.get("/isEmail/:walletAddress", isEmailRegistered);


export default AuthRoute;
