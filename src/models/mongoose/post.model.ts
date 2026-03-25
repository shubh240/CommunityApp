import mongoose, { Schema } from 'mongoose';
import { PostAttributes, PostType, PostVisibility } from './interfaces/post.model.interface';

const checkinSchema = new Schema(
  {
    location: { type: String, default: '' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
  },
  { _id: false }
);

const postSchema = new Schema<PostAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    content: { type: String, default: '' },

    postType: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VIDEO'] as PostType[],
      default: 'TEXT',
      index: true,
    },

    visibility: {
      type: String,
      enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'] as PostVisibility[],
      default: 'PUBLIC',
      index: true,
    },

    // New Post extras
    feeling: { type: String, default: '' },
    checkin: { type: checkinSchema, default: null },
    taggedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

const Post = mongoose.model<PostAttributes>('Post', postSchema);

export default Post;
