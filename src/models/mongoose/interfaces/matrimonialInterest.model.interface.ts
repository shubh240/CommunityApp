import { Document, Types } from 'mongoose';

export type MatrimonialInterestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface MatrimonialInterestAttributes extends Document {
  fromUserId: Types.ObjectId;          // user who sent the interest
  fromProfileId: Types.ObjectId;       // matrimonial profile of sender
  toUserId: Types.ObjectId;            // user who owns the target profile
  toProfileId: Types.ObjectId;         // target matrimonial profile

  status: MatrimonialInterestStatus;

  message: string;                     // optional message with interest

  createdAt: Date;
  updatedAt: Date;
}
