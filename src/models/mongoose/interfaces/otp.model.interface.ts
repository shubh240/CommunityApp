import { Document } from 'mongoose';

export interface OtpAttributes extends Document {
  mobile: number;
  otp: number;
  otpType: 'LOGIN' | 'SIGNUP';
  expiresAt: Date;
}
