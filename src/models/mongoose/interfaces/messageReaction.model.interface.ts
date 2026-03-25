import { Document, Types } from 'mongoose';

export interface MessageReactionAttributes extends Document {
  messageId: Types.ObjectId;
  userId: Types.ObjectId;
  emoji: string;          // e.g. "😍", "👍", "🔥", "❤️"

  createdAt: Date;
  updatedAt: Date;
}
