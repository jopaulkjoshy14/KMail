import dotenv from 'dotenv';
dotenv.config();

export default {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
  MAX_ATTACHMENT_SIZE_MB: parseInt(process.env.MAX_ATTACHMENT_SIZE_MB, 10) || 10,
};
