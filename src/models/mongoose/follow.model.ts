import mongoose, { Schema } from 'mongoose';
import { FollowAttributes } from './interfaces/follow.model.interface';

const followSchema = new Schema<FollowAttributes>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

followSchema.index(
  { requesterId: 1, receiverId: 1 },
  { unique: true }
);

followSchema.index({ receiverId: 1, status: 1, createdAt: -1 });

const Follow = mongoose.model<FollowAttributes>('Follow', followSchema);

export default Follow;
