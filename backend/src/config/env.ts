import dotenv from "dotenv";
dotenv.config();

const requiredVars = ["DB_URI", "CONTRACT_ADDRESS", "RPC_URL", "JWT_SECRET"] as const;

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing ${key} in environment variables.`);
  }
});

export const ENV = {
  DB_URI: process.env.DB_URI as string,
  CONTRACT_ADDRESS:process.env.CONTRACT_ADDRESS as string,
  RPC_URL:process.env.RPC_URL,
  JWT_SECRET: process.env.JWT_SECRET as string,
//   PORT: process.env.PORT || "3000",
//   CLIENT_URL: process.env.CLIENT_URL as string,
//   CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:8081",
};
