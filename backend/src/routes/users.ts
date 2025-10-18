// routes/kycRoutes.ts
import express from "express";
import deleteKYC, {
  getRecordByAddress,
  getNotification,
  updateNotification,
  controlAccess,
} from "../controllers/user";

const UserRoute = express.Router()
UserRoute.get('/:walletAddress', getRecordByAddress)
.delete('/delete:walletAddress', deleteKYC)
.get("/notifications/:to", getNotification)
.patch("/read", updateNotification)
.patch("/control_access", controlAccess);
export default UserRoute;
