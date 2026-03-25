import { Document, Types } from 'mongoose';

export type NotificationType =
  | 'FOLLOW_REQUEST'
  | 'FOLLOW_ACCEPTED'
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'STORY_VIEW'
  | 'MATRIMONIAL_INTEREST'
  | 'MATRIMONIAL_INTEREST_ACCEPTED'
  | 'MATRIMONIAL_INTEREST_REJECTED'
  | 'CHAT_MESSAGE'
  | 'GROUP_ADDED'
  | 'NEWS_PUBLISHED';

export interface NotificationAttributes extends Document {
  _id: Types.ObjectId;

  senderId?: Types.ObjectId;
  receiverId: Types.ObjectId;

  type: NotificationType;

  referenceId?: Types.ObjectId;

  title: string;
  message: string;

  isRead: boolean;
}
