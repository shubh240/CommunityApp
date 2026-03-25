import { Document, Types } from 'mongoose';

export interface PostCommentAttributes extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  parentCommentId?: Types.ObjectId;
  text: string;
  isDeleted: boolean;
}
