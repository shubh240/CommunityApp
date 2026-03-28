import { Document, Types } from 'mongoose';

export interface MatrimonialProfileViewAttributes extends Document {
  viewerId: Types.ObjectId;
  profileId: Types.ObjectId;
}
