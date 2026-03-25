import mongoose, { Schema } from 'mongoose';
import { StoryViewAttributes } from './interfaces/storyView.model.interface';

const storyViewSchema = new Schema<StoryViewAttributes>(
  {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
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

storyViewSchema.index(
  { storyId: 1, userId: 1 },
  { unique: true }
);

const StoryView = mongoose.model<StoryViewAttributes>(
  'StoryView',
  storyViewSchema
);

export default StoryView;
