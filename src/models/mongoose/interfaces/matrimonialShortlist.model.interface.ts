import { Document, Types } from 'mongoose';

export interface MatrimonialShortlistAttributes extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
}
