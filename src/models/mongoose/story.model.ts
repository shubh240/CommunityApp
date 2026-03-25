import mongoose, { Schema } from 'mongoose';
import { StoryAttributes } from './interfaces/story.model.interface';

const storySchema = new Schema<StoryAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
      required: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

const Story = mongoose.model<StoryAttributes>('Story', storySchema);

export default Story;
