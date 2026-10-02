/************************ 
** File: src/config/env.js
**  NODE_ENV
**  PORT
**  MONGO_URI
**  JWT_SECRET
**  JWT_EXPIRES_IN
**  CLIENT_URL
*/

import dotenv from "dotenv";

dotenv.config();

const getNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: getNumber(process.env.PORT, 5000),
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000"
};

const requiredVars = ["MONGO_URI", "JWT_SECRET"];

for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export default env;

