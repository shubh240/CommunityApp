import mongoose, { Schema } from 'mongoose';
import { MatrimonialInterestAttributes } from './interfaces/matrimonialInterest.model.interface';

const matrimonialInterestSchema = new Schema<MatrimonialInterestAttributes>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    fromProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'MatrimonialProfile',
      required: true,
      index: true,
    },

    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    toProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'MatrimonialProfile',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },

    message: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// One interest per pair of profiles
matrimonialInterestSchema.index(
  { fromProfileId: 1, toProfileId: 1 },
  { unique: true }
);
matrimonialInterestSchema.index({ toUserId: 1, status: 1, createdAt: -1 });
matrimonialInterestSchema.index({ fromUserId: 1, status: 1, createdAt: -1 });

const MatrimonialInterest = mongoose.model<MatrimonialInterestAttributes>(
  'MatrimonialInterest',
  matrimonialInterestSchema
);

export default MatrimonialInterest;
