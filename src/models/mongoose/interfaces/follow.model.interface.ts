import { Document, Types } from 'mongoose';

export type FollowStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface FollowAttributes extends Document {
  _id: Types.ObjectId;

  requesterId: Types.ObjectId;
  receiverId: Types.ObjectId;

  status: FollowStatus;
}
