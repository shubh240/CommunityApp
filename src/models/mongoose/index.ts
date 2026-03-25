import { MONGO_DATABASE_URL } from '@/config';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

let db: typeof mongoose | null;

const connectMongoDB = async (): Promise<typeof mongoose> => {
  try {
    if (!db) {
      db = await mongoose.connect(MONGO_DATABASE_URL, {});
      logger.info('MongoDB connected successfully');
    }

    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error; // Re-throw the error to handle it elsewhere if needed
  }
};

export default connectMongoDB;
