import { Document, Types } from 'mongoose';

export interface CommentLikeAttributes extends Document {
  commentId: Types.ObjectId;
  userId: Types.ObjectId;
}
