import mongoose, { Schema, Document, Types } from 'mongoose';

export interface AdminTokenAttributes extends Document {
  adminId: Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  deviceInfo: {
    deviceId: string;
    platform: 'web' | 'android' | 'ios';
    appVersion?: string;
  };
  expiresAt: Date;
}
