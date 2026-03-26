import type { Request } from 'express';
import Notification from '@/models/mongoose/notification.model';

export default class NotificationRepo {
  constructor() {}

  // ─── Get Notifications ──────────────────────────────
  readonly getNotifications = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const total = await Notification.countDocuments({ receiverId: userId });
    const unreadCount = await Notification.countDocuments({ receiverId: userId, isRead: false });

    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('senderId', 'firstName lastName profileImage')
      .lean();

    return {
      notifications,
      unreadCount,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Mark Notification as Read ──────────────────────
  readonly markAsRead = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { notificationId } = req.params;

    await Notification.updateOne(
      { _id: notificationId, receiverId: userId },
      { isRead: true }
    );

    return { read: true };
  };

  // ─── Mark All Notifications as Read ─────────────────
  readonly markAllAsRead = async (req: Request) => {
    const userId = req.userTokenData._id;

    const result = await Notification.updateMany(
      { receiverId: userId, isRead: false },
      { isRead: true }
    );

    return { markedCount: result.modifiedCount };
  };
}
