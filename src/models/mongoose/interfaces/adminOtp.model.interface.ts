import { Document, Types } from 'mongoose';

export interface AdminOtpAttributes extends Document {
  adminId: Types.ObjectId;
  mobile: number;
  otp: number;
  resetToken?: string;
  tokenUsed?: boolean;
  expiresAt: Date;
}
