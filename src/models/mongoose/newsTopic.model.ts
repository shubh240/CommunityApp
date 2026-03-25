import mongoose, { Schema } from 'mongoose';
import { NewsTopicAttributes } from './interfaces/newsTopic.model.interface';

const newsTopicSchema = new Schema<NewsTopicAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    topicSlug: { type: String, required: true },
    topicName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// One subscription per user per topic
newsTopicSchema.index({ userId: 1, topicSlug: 1 }, { unique: true });

const NewsTopic = mongoose.model<NewsTopicAttributes>(
  'NewsTopic',
  newsTopicSchema
);

export default NewsTopic;
