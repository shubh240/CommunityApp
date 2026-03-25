import { Document, Types } from 'mongoose';

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';

export interface ChatMessageAttributes extends Document {
  chatRoomId: Types.ObjectId;
  senderId: Types.ObjectId;
  messageType: ChatMessageType;
  message: string;
  mediaUrl: string | null;

  // Reply / thread
  replyToMessageId: Types.ObjectId | null;

  // Edit tracking
  isEdited: boolean;
  editedAt: Date | null;

  isRead: boolean;
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}
