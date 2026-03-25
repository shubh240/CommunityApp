import mongoose, { Schema } from 'mongoose';
import { NewsAuthorFollowAttributes } from './interfaces/newsAuthorFollow.model.interface';

const newsAuthorFollowSchema = new Schema<NewsAuthorFollowAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    authorSlug: { type: String, required: true },
    authorName: { type: String, required: true },
    authorLogo: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// One follow per user per author
newsAuthorFollowSchema.index(
  { userId: 1, authorSlug: 1 },
  { unique: true }
);

const NewsAuthorFollow = mongoose.model<NewsAuthorFollowAttributes>(
  'NewsAuthorFollow',
  newsAuthorFollowSchema
);

export default NewsAuthorFollow;
