import mongoose, { Schema, Document, Types } from 'mongoose';
import { AdminTokenAttributes } from './interfaces/adminToken.model.interface';

const adminTokenSchema = new Schema<AdminTokenAttributes>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
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
      deviceId: { type: String, required: true },
      platform: {
        type: String,
        enum: ['web', 'android', 'ios'],
        required: true,
      },
      appVersion: String,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

adminTokenSchema.index({ adminId: 1, 'deviceInfo.deviceId': 1 });

const AdminToken = mongoose.model<AdminTokenAttributes>(
  'AdminToken',
  adminTokenSchema
);

export default AdminToken;
