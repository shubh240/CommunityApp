import mongoose, { Schema } from 'mongoose';
import { MatrimonialProfileViewAttributes } from './interfaces/matrimonialProfileView.model.interface';

const matrimonialProfileViewSchema = new Schema<MatrimonialProfileViewAttributes>(
  {
    viewerId: {
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

// One view record per viewer-profile pair (upsert to track latest view)
matrimonialProfileViewSchema.index({ viewerId: 1, profileId: 1 }, { unique: true });
matrimonialProfileViewSchema.index({ profileId: 1, createdAt: -1 });

const MatrimonialProfileView = mongoose.model<MatrimonialProfileViewAttributes>(
  'MatrimonialProfileView',
  matrimonialProfileViewSchema
);

export default MatrimonialProfileView;
