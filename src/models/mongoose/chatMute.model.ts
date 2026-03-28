import mongoose, { Schema } from 'mongoose';
import { ChatMuteAttributes } from './interfaces/chatMute.model.interface';

const chatMuteSchema = new Schema<ChatMuteAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true,
    },

    mutedUntil: {
      type: Date,
      default: null, // null = muted forever until manually unmuted
    },
  },
  {
    timestamps: true,
  }
);

chatMuteSchema.index({ userId: 1, chatRoomId: 1 }, { unique: true });

const ChatMute = mongoose.model<ChatMuteAttributes>('ChatMute', chatMuteSchema);

export default ChatMute;
