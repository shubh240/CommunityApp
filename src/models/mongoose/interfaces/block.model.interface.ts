import { Document, Types } from 'mongoose';

export interface BlockAttributes extends Document {
  blockerId: Types.ObjectId;
  blockedId: Types.ObjectId;
}
