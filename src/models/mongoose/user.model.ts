import mongoose, { Document, Schema } from 'mongoose';
import { UserAttributes } from './interfaces/user.model.interface';
import { Types } from 'mongoose';

const userSchema = new Schema<UserAttributes>(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    mobile: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['NEW', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NEW',
    },
    language: {
      type: String,
      default: 'en',
    },
    address: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },
    onboardingStep: {
      type: Number,
      default: 1,
      /*
        1 = Complete Profile
        2 = Address Proof
        3 = Identity Doc
        4 = Education Doc
        5 = Other Docs
        6 = Under Review
        7 = Approved
      */
    },
    kycStatus: {
      type: String,
      enum: [
        'NOT_STARTED',
        'IN_PROGRESS',
        // 'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED'
      ],
      default: 'NOT_STARTED',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ mobile: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model<UserAttributes>('User', userSchema);

export default User;
