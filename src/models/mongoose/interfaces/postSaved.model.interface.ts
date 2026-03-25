import { Document, Types } from 'mongoose';

export interface PostSavedAttributes extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
}
