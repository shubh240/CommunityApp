import mongoose, { Schema } from 'mongoose';
import { CommentLikeAttributes } from './interfaces/commentLike.model.interface';

const commentLikeSchema = new Schema<CommentLikeAttributes>(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'PostComment',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

const CommentLike = mongoose.model<CommentLikeAttributes>(
  'CommentLike',
  commentLikeSchema
);

export default CommentLike;
