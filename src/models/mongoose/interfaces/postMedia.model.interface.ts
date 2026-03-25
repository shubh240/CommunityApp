import { Document, Types } from 'mongoose';

export type PostMediaType = 'IMAGE' | 'VIDEO';

export interface PostMediaAttributes extends Document {
  postId: Types.ObjectId;
  mediaType: PostMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  size: number;
  isDeleted : boolean
}
