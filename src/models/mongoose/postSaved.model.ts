import mongoose, { Schema } from 'mongoose';
import { PostSavedAttributes } from './interfaces/postSaved.model.interface';

const postSavedSchema = new Schema<PostSavedAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true
  }
);

postSavedSchema.index({ userId: 1, postId: 1 }, { unique: true });

postSavedSchema.index({ userId: 1, createdAt: -1 });

const PostSaved = mongoose.model<PostSavedAttributes>(
  'PostSaved',
  postSavedSchema
);

export default PostSaved;
