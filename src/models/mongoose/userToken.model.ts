import mongoose, { Schema, Types } from 'mongoose';
import { UserTokenAttributes } from './interfaces/userToken.model.interface';

const userTokenSchema = new Schema<UserTokenAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    accessToken: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    deviceInfo: {
      deviceId: {
        type: String,
        required: true,
      },
      platform: {
        type: String,
        enum: ['android', 'ios', 'web'],
        required: true,
      },
      appVersion: {
        type: String,
        required: false,
      },
    },

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true
  }
);

userTokenSchema.index({ userId: 1 });
userTokenSchema.index({ refreshToken: 1 });


const UserToken = mongoose.model<UserTokenAttributes>(
  'UserToken',
  userTokenSchema
);

export default UserToken;
