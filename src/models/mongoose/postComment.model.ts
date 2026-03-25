import mongoose, { Schema } from 'mongoose';
import { PostCommentAttributes } from './interfaces/postComment.model.interface';

const postCommentSchema = new Schema<PostCommentAttributes>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'PostComment',
      required: false,
      index: true,
    },

    text: {
      type: String,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true
  }
);

postCommentSchema.index({ postId: 1, createdAt: -1 });
postCommentSchema.index({ parentCommentId: 1, createdAt: 1 });

const PostComment = mongoose.model<PostCommentAttributes>(
  'PostComment',
  postCommentSchema
);

export default PostComment;
