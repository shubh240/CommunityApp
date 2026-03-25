import { Document, Types } from 'mongoose';

// Represents a user following a news publisher/author
export interface NewsAuthorFollowAttributes extends Document {
  userId: Types.ObjectId;

  authorSlug: string;       // unique key e.g. "bbc-news", "cnn"
  authorName: string;       // display name e.g. "BBC News"
  authorLogo: string;       // logo image URL

  createdAt: Date;
  updatedAt: Date;
}
