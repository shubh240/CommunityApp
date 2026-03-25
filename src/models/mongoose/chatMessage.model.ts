import mongoose, { Schema } from 'mongoose';
import { ChatMessageAttributes, ChatMessageType } from './interfaces/chatMessage.model.interface';

const chatMessageSchema = new Schema<ChatMessageAttributes>(
  {
    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    messageType: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE'] as ChatMessageType[],
      default: 'TEXT',
      required: true,
    },

    message: { type: String, default: '' },
    mediaUrl: { type: String, default: null },

    replyToMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
      default: null,
    },

    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },

    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ chatRoomId: 1, createdAt: 1 });
chatMessageSchema.index({ chatRoomId: 1, isDeleted: 1 });

const ChatMessage = mongoose.model<ChatMessageAttributes>(
  'ChatMessage',
  chatMessageSchema
);

export default ChatMessage;
