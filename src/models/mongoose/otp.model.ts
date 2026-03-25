import mongoose, { Schema } from 'mongoose';
import { OtpAttributes } from './interfaces/otp.model.interface';

const otpSchema = new Schema<OtpAttributes>(
  {
    mobile: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    otpType: {
      type: String,
      enum: ['LOGIN', 'SIGNUP'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Otp = mongoose.model<OtpAttributes>('Otp', otpSchema);

export default Otp;
