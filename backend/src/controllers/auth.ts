import { Request, Response, urlencoded } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import bcrypt from "bcrypt"
import jwt, {JwtPayload} from "jsonwebtoken";
dotenv.config();

import User from "../models/users";  // Updated model import based on the new schema
import { DAGKYC_ABI } from "../config/ABI";
import users from "../models/users";
import ThirdParty from "../models/thirdParty";
import { ENV } from "../config/env";
export default function toto(addr: string) {
    try {
      return ethers.utils.getAddress(addr);
    } catch {
      return addr.toLowerCase();
    }
  }
  
export const Register = async (req: Request, res: Response) => {
    try {
      const { walletAddress, encryptedData, transactionHash, NIN, email, password } = req.body;
  
      if (!walletAddress || !encryptedData || !transactionHash) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Check if user already exists with the provided wallet address
      const existingUser = await User.findOne({ walletAddress: toto(walletAddress) });
      if (existingUser) {
        return res.status(400).json({ error: "Wallet address already registered" });
      }
  
      // Generate a unique KYC ID
      const uniqueId = `KYC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new user entry
      const newUser = new User({
        walletAddress: toto(walletAddress),
        NIN,
        email,
        password:hashedPassword,
        kyc: {
          encryptedData,
          uniqueId,
          transactionHash,
          userType: "user",  // Defaulting to "user", you can change based on your needs
          timestamp: new Date(),
        },
      });
  
      // Save KYC record and user
      // await newKYC.save();
      await newUser.save();
  
      return res.status(201).json({ message: "User and KYC registered successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error saving KYC and User" });
    }
  };
  
  /**
   * GET /api/kyc/is-registered/:walletAddress
   * Returns { registered: true | false }
   */
  export const isWalletRegistered = async (req: Request, res: Response) => {
    try {
      const wallet = toto(req.params.walletAddress);
      const user = await User.findOne({ walletAddress: wallet });
  
      return res.json({ registered: !!user });
    } catch (err) {
      console.error("isWalletRegistered error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
  
  /**
   * GET /api/kyc/is-nin-registered/:NIN
   * Returns { registered: true | false }
   */
  export const isNINRegistered = async (req: Request, res: Response) => {
    try {
      const { NIN } = req.params;
      const user = await User.findOne({ NIN });
  
      return res.json({ registered: !!user });
    } catch (err) {
      console.error("isNINRegistered error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
  
  /**
   * GET /api/kyc/is-email-registered/:email
   * Returns { registered: true | false }
   */
  export const isEmailRegistered = async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const user = await User.findOne({ email });
  
      return res.json({ registered: !!user });
    } catch (err) {
      console.error("isEmailRegistered error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
  


  //
  // Controller to register KYC data
export const ThirdPartyReg = async (req: Request, res: Response) => {
    const {
      appName,
      detail,
      description,
      website,
      walletAddress,
      transactionHash,
    } = req.body;
  
    // Simple validation
    if (!appName || !description || !walletAddress || !transactionHash) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      // Check if the user has already registered
      const existingUser = await ThirdParty.findOne({ walletAddress });
      if (existingUser) {
        return res.status(400).json({ error: "User already registered" });
      }
  
      // Save the new KYC record to the database
      const newKyc = new ThirdParty({
        appName,
        detail,
        description,
        website,
        walletAddress,
        transactionHash,
      });
  
      await newKyc.save();
  
      // Respond with success
      return res.status(200).json({ message: "KYC registration successful!" });
    } catch (error) {
      console.error("Error registering KYC:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  export const isRegistered_thirdParty = async (req: Request, res: Response) => {
    try {
      const wallet = toto(req.params.walletAddress);
      const user = await ThirdParty.findOne({ walletAddress: wallet });
  
      return res.json({ registered: !!user });
    } catch (err) {
      console.error("isWalletRegistered error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
  
interface IUSER {
  password:string,
  walletAddress:string,
  transactionHash:string,
  encryptedData:string
}

export const Login = async (req: Request, res: Response) => {
  try {
    const { walletAddress, password } = req.body;

    // Ensure body fields are present
    if (!walletAddress || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // Fetch user or thirdParty (use await!)
    const user: any = await users.findOne({ walletAddress });
    const thirdParty: any = !user ? await ThirdParty.findOne({ walletAddress }) : null;

    // No user found
    if (!user && !thirdParty) {
      return res.status(404).json({
        message: "This wallet is not registered",
      });
    }

    const account = user || thirdParty;

    // Compare password (await it!)
    const matched = await bcrypt.compare(password, account.password);
    if (!matched) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }

    // Build payload based on user or third party
    const payLoad = {
      walletAddress: account.walletAddress,
      id: account.id,
      role: account.kyc.userType,
    };

    const token = jwt.sign(payLoad, ENV.JWT_SECRET, {
      expiresIn: "11d",
    });

    return res.status(200).json({
      message: "Login successful",
      isLoggedIn: true,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error
    });
  }
};
