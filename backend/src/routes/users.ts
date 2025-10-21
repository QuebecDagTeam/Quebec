// routes/kycRoutes.ts
import express from "express";
import deleteKYC, {
  getRecordByAddress,
  getNotification,
  updateNotification,
  controlAccess,
} from "../controllers/user";
import { authMiddleware } from "../middleware.ts/authMiddleware";

const UserRoute = express.Router()
UserRoute.get('/:walletAddress', authMiddleware, getRecordByAddress)
.delete('/delete/:walletAddress', authMiddleware, deleteKYC)
.get("/notifications/:walletAddress/:uniqueId", authMiddleware, getNotification)
.patch("/read", authMiddleware, updateNotification)
.patch("/control_access/:walletAddress", authMiddleware, controlAccess);
export default UserRoute;
