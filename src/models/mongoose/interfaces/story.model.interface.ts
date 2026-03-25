import { Document, Types } from 'mongoose';

export type StoryMediaType = 'IMAGE' | 'VIDEO';

export interface StoryAttributes extends Document {
  _id: Types.ObjectId;

  userId: Types.ObjectId;

  mediaType: StoryMediaType;
  mediaUrl: string;

  thumbnailUrl?: string;

  expiresAt: Date;

  isDeleted: boolean;
}
