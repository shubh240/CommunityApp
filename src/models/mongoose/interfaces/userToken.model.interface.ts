import { Document, Types } from 'mongoose';

export interface DeviceInfo {
  deviceId: string;
  platform: 'android' | 'ios' | 'web';
  appVersion?: string;
}

export interface UserTokenAttributes extends Document {
  userId: Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
