import mongoose, { Schema } from 'mongoose';
import { ChatRoomAttributes, ChatRoomType, GroupType } from './interfaces/chatRoom.model.interface';

const chatRoomSchema = new Schema<ChatRoomAttributes>(
  {
    type: {
      type: String,
      enum: ['DIRECT', 'GROUP'] as ChatRoomType[],
      default: 'DIRECT',
      required: true,
      index: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageType: { type: String, default: 'TEXT' },

    // Group-specific fields
    name: { type: String, default: '' },
    groupImage: { type: String, default: '' },
    groupType: {
      type: String,
      enum: ['PUBLIC', 'PRIVATE', 'PASSWORD'] as GroupType[],
      default: 'PUBLIC',
    },
    password: { type: String, default: '' },
    description: { type: String, default: '' },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    adminIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    moderatorIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    bannedMemberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ type: 1, lastMessageAt: -1 });

const ChatRoom = mongoose.model<ChatRoomAttributes>('ChatRoom', chatRoomSchema);

export default ChatRoom;
