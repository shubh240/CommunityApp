import mongoose, { Schema } from 'mongoose';
import { PostLikeAttributes } from './interfaces/postLike.model.interface';

const postLikeSchema = new Schema<PostLikeAttributes>(
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
  },
  {
    timestamps: true
  }
);

postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const PostLike = mongoose.model<PostLikeAttributes>(
  'PostLike',
  postLikeSchema
);

export default PostLike;
