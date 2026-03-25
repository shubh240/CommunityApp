import mongoose, { Schema, Types } from 'mongoose';
import { PostMediaAttributes } from './interfaces/postMedia.model.interface';

const postMediaSchema = new Schema<PostMediaAttributes>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },

    mediaType: {
      type: String,
      enum: ['IMAGE', 'VIDEO'],
      required: true,
    },

    mediaUrl: {
      type: String,
      required: true,
    },

    thumbnailUrl: {
      type: String,
      required: false, // Only required for videos
    },

    duration: {
      type: Number,
      required: false, // Only required for videos (in seconds)
    },

    size: {
      type: Number,
      required: true, // File size of the media
    },
    
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

postMediaSchema.index({ postId: 1, mediaType: 1 });

const PostMedia = mongoose.model<PostMediaAttributes>('PostMedia', postMediaSchema);

export default PostMedia;


