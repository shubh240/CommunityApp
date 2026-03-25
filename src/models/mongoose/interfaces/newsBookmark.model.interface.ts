import { Document, Types } from 'mongoose';

export interface NewsBookmarkAttributes extends Document {
  userId: Types.ObjectId;

  // External article details cached at bookmark time
  articleUrl: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceName: string;   // e.g. "BBC News", "CNN"
  sourceLogo: string;
  publishedAt: Date;
  category: string;     // Sports, Politics, Health, etc.

  createdAt: Date;
  updatedAt: Date;
}
