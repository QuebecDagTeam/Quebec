// routes/kycRoutes.ts
import express from "express";
import {
  requestAccess,
  getThirdPartyRecord
} from "../controllers/thirdParty";

const ThirdPartyRoute = express.Router();
ThirdPartyRoute.post("/request/:uniqueId/:adress", requestAccess)
.get('/record/:address', getThirdPartyRecord)
export default ThirdPartyRoute;
