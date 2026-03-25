import { Document, Types } from 'mongoose';

export type DeviceType = 'ANDROID' | 'IOS' | 'WEB';

export interface UserDeviceTokenAttributes extends Document {
  userId: Types.ObjectId;
  token: string;
  deviceType: DeviceType;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
