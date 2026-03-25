import mongoose, { Schema } from 'mongoose';
import { UserDeviceTokenAttributes } from './interfaces/userDeviceToken.model.interface';

const userDeviceTokenSchema = new Schema<UserDeviceTokenAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      index: true,
    },

    deviceType: {
      type: String,
      enum: ['ANDROID', 'IOS', 'WEB'],
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

userDeviceTokenSchema.index(
  { userId: 1, token: 1 },
  { unique: true }
);

userDeviceTokenSchema.index({ isActive: 1, deviceType: 1 });

const UserDeviceToken = mongoose.model<UserDeviceTokenAttributes>(
  'UserDeviceToken',
  userDeviceTokenSchema
);

export default UserDeviceToken;
