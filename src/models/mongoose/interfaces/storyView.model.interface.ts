import { Document, Types } from 'mongoose';

export interface StoryViewAttributes extends Document {
  _id: Types.ObjectId;

  storyId: Types.ObjectId;
  userId: Types.ObjectId;
}
