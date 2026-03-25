import { Document, Types } from 'mongoose';

export interface PostLikeAttributes extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
}
