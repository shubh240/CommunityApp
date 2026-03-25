import mongoose, { Schema } from 'mongoose';
import { NotificationAttributes } from './interfaces/notification.model.interface';

const notificationSchema = new Schema<NotificationAttributes>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'FOLLOW_REQUEST',
        'FOLLOW_ACCEPTED',
        'POST_LIKE',
        'POST_COMMENT',
        'STORY_VIEW',
        'MATRIMONIAL_INTEREST',
        'MATRIMONIAL_INTEREST_ACCEPTED',
        'MATRIMONIAL_INTEREST_REJECTED',
        'CHAT_MESSAGE',
        'GROUP_ADDED',
        'NEWS_PUBLISHED',
      ],
      required: true,
      index: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<NotificationAttributes>(
  'Notification',
  notificationSchema
);

export default Notification;
