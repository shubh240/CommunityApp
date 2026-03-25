import mongoose, { Schema } from 'mongoose';
import { MessageReactionAttributes } from './interfaces/messageReaction.model.interface';

const messageReactionSchema = new Schema<MessageReactionAttributes>(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    emoji: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// One reaction per user per message (user can change/replace their reaction)
messageReactionSchema.index(
  { messageId: 1, userId: 1 },
  { unique: true }
);

const MessageReaction = mongoose.model<MessageReactionAttributes>(
  'MessageReaction',
  messageReactionSchema
);

export default MessageReaction;
