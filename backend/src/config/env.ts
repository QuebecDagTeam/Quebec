import dotenv from "dotenv";
dotenv.config();

const requiredVars = ["DB_URI", "CONTRACT_ADDRESS", "RPC_URL"] as const;

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing ${key} in environment variables.`);
  }
});

export const ENV = {
  DB_URI: process.env.DB_URI as string,
  CONTRACT_ADDRESS:process.env.CONTRACT_ADDRESS as string,
  RPC_URL:process.env.RPC_URL 
//   JWT_SECRET: process.env.JWT_SECRET as string,
//   EXPIRE_TIME: process.env.EXPIRE_TIME as string,
//   PORT: process.env.PORT || "3000",
//   GMAIL_USER:process.env.GMAIL_USER as string,
//   GMAIL_PASS:process.env.GMAIL_PASS as string,
//   CLIENT_URL: process.env.CLIENT_URL as string,
//   CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:8081",
//   DATABASE_URL:process.env.DATABASE_URL as string,
//   NODE_ENV:process.env.NODE_ENV as string
};
