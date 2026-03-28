import { Document, Types } from 'mongoose';

export interface ChatMuteAttributes extends Document {
  userId: Types.ObjectId;
  chatRoomId: Types.ObjectId;
  mutedUntil: Date | null; // null = muted forever
}
