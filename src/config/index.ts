import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';

export const {
  NODE_ENV,
  PORT,
  API_VERSION,
  LOG_FORMAT,
  LOG_DIR,
  SECRET_KEY,
  SEQUELIZE_DATABASE_URL,
  MONGO_DATABASE_URL,
} = process.env;

export const JWT_SECRET  = process.env.JWT_SECRET!
export const JWT_ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES!
export const JWT_REFRESH_EXPIRES  = process.env.JWT_REFRESH_EXPIRES!

