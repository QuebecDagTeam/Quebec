import { NextFunction, Request, Response } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import { ENV } from "../config/env";

interface authenticatedRequest extends Request{
    user?: any | JwtPayload
}


export const authMiddleware = (req:authenticatedRequest, res:Response, next:NextFunction)=>{
    try {
        const token = req.headers.authorization?.replace("Bearer", "").trim();
        if(!token){
            res.status(401).json({
                status:"Authentication error",
                messge:"please login to have access"
            })
            return
        }
        const decoded = jwt.verify(token ||'', ENV.JWT_SECRET );
         if(!decoded || decoded === null || decoded === undefined){
            res.status(401).json({
                status:"Authentication error",
                messge:"please login to have access"
            })
            return
        }
        req.user = decoded
        next()
    } catch (error) {
        res.status(500).json({
            status:"Error",
            message:"Internal server error",
            error
        })
        return
    }
}