import mongoose, { Schema } from 'mongoose';
import { AdminOtpAttributes } from './interfaces/adminOtp.model.interface';

const adminOtpSchema = new Schema<AdminOtpAttributes>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true,
    },
    mobile: {
      type: Number,
      required: true,
      index: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    resetToken: {
      type: String,
      default: null,
      index: true,
    },
    tokenUsed: {
      type: Boolean,
      default: false,
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

const AdminOtp = mongoose.model<AdminOtpAttributes>('AdminOtp', adminOtpSchema);

export default AdminOtp;
