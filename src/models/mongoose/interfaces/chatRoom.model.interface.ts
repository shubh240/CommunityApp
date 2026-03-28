import { Document, Types } from 'mongoose';

export type ChatRoomType = 'DIRECT' | 'GROUP';
export type GroupType = 'PUBLIC' | 'PRIVATE' | 'PASSWORD';

export interface ChatRoomAttributes extends Document {
  type: ChatRoomType;
  participants: Types.ObjectId[];

  // Direct chat fields
  lastMessage: string;
  lastMessageAt: Date;
  lastMessageType: string;

  // Group-specific fields
  name: string;
  groupImage: string;
  groupType: GroupType;
  password: string;             // hashed, for PASSWORD type groups
  description: string;
  ownerId: Types.ObjectId;
  adminIds: Types.ObjectId[];
  moderatorIds: Types.ObjectId[];
  bannedMemberIds: Types.ObjectId[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
