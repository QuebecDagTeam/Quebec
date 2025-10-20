// routes/kycRoutes.ts
import express from "express";
import deleteKYC, {
  Register,
  Login,
  isRegistered_thirdParty,
  ThirdPartyReg,
  isWalletRegistered,
  isIDRegistered,
  isEmailRegistered
} from "../controllers/auth";

const AuthRoute = express.Router();
AuthRoute.post("/register", Register)
.delete('/delete-user/:walletAddress', deleteKYC)
.post("/register_thirdparty", ThirdPartyReg)
.get("/isRegistered_thirdParty/:walletAddress", isRegistered_thirdParty)
.post("/login", Login)
.get("/isRegistered/:walletAddress", isWalletRegistered)
.get("/is_id/:idType/:idNumber", isIDRegistered)
.get("/is_email/:email", isEmailRegistered);


export default AuthRoute;
