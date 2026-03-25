import { Document, Types } from 'mongoose';

// Represents a topic a user follows/saves
export interface NewsTopicAttributes extends Document {
  userId: Types.ObjectId;
  topicSlug: string;    // e.g. "health", "technology", "politics"
  topicName: string;    // e.g. "Health", "Technology"

  createdAt: Date;
  updatedAt: Date;
}
