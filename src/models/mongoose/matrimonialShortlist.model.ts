import mongoose, { Schema } from 'mongoose';
import { MatrimonialShortlistAttributes } from './interfaces/matrimonialShortlist.model.interface';

const matrimonialShortlistSchema = new Schema<MatrimonialShortlistAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'MatrimonialProfile',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

matrimonialShortlistSchema.index({ userId: 1, profileId: 1 }, { unique: true });

const MatrimonialShortlist = mongoose.model<MatrimonialShortlistAttributes>(
  'MatrimonialShortlist',
  matrimonialShortlistSchema
);

export default MatrimonialShortlist;
