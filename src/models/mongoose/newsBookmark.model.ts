import mongoose, { Schema } from 'mongoose';
import { NewsBookmarkAttributes } from './interfaces/newsBookmark.model.interface';

const newsBookmarkSchema = new Schema<NewsBookmarkAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    articleUrl: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    sourceName: { type: String, default: '' },
    sourceLogo: { type: String, default: '' },
    publishedAt: { type: Date, required: false },
    category: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// One bookmark per user per article
newsBookmarkSchema.index({ userId: 1, articleUrl: 1 }, { unique: true });
newsBookmarkSchema.index({ userId: 1, createdAt: -1 });

const NewsBookmark = mongoose.model<NewsBookmarkAttributes>(
  'NewsBookmark',
  newsBookmarkSchema
);

export default NewsBookmark;
