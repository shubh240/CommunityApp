import type { Request } from 'express';
import User from '@/models/mongoose/user.model';
import Post from '@/models/mongoose/post.model';
import Story from '@/models/mongoose/story.model';
import MatrimonialProfile from '@/models/mongoose/matrimonialProfile.model';
import ChatRoom from '@/models/mongoose/chatRoom.model';
import Report from '@/models/mongoose/report.model';
import UserDeviceToken from '@/models/mongoose/userDeviceToken.model';
import { sendUserPushNotification } from '@/services/pushNotification';

export default class AdminDashboardRepo {
  constructor() {}

  // ─── Dashboard Stats ──────────────────────────────
  readonly getDashboardStats = async (req: Request) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      kycPending,
      kycUnderReview,
      kycApproved,
      kycRejected,
      totalPosts,
      totalStories,
      totalMatrimonialProfiles,
      matrimonialUnderReview,
      totalGroups,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true, isBlocked: false }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      User.countDocuments({ kycStatus: 'NOT_STARTED' }),
      User.countDocuments({ kycStatus: 'UNDER_REVIEW' }),
      User.countDocuments({ kycStatus: 'APPROVED' }),
      User.countDocuments({ kycStatus: 'REJECTED' }),
      Post.countDocuments({ isDeleted: false }),
      Story.countDocuments({ isDeleted: false, expiresAt: { $gt: now } }),
      MatrimonialProfile.countDocuments({ isActive: true }),
      MatrimonialProfile.countDocuments({ isActive: true, status: 'UNDER_REVIEW' }),
      ChatRoom.countDocuments({ type: 'GROUP', isActive: true }),
      Report.countDocuments({ status: 'PENDING' }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
      },
      kyc: {
        notStarted: kycPending,
        underReview: kycUnderReview,
        approved: kycApproved,
        rejected: kycRejected,
      },
      content: {
        totalPosts,
        activeStories: totalStories,
        totalGroups,
      },
      matrimonial: {
        totalProfiles: totalMatrimonialProfiles,
        underReview: matrimonialUnderReview,
      },
      reports: {
        pending: pendingReports,
      },
    };
  };

  // ─── Growth (Signups over time) ───────────────────
  readonly getGrowth = async (req: Request) => {
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    // Aggregate signup counts by date
    const signups = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build a map for quick lookup
    const countMap = new Map<string, number>();
    signups.forEach((s: any) => countMap.set(s._id, s.count));

    // Fill in all days (including days with 0 signups)
    const data: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      data.push({
        date: dateStr,
        count: countMap.get(dateStr) || 0,
      });
    }

    return {
      days,
      data,
    };
  };

  // ─── Broadcast Notification ───────────────────────
  readonly broadcast = async (req: Request) => {
    const { title, message, targetType, kycStatus, city, userIds } = req.body;

    // Build user filter based on targetType
    const userFilter: any = { isActive: true, isBlocked: false };

    if (targetType === 'KYC_STATUS') {
      userFilter.kycStatus = kycStatus;
    } else if (targetType === 'CITY') {
      userFilter['address.city'] = { $regex: city, $options: 'i' };
    } else if (targetType === 'USER_IDS') {
      userFilter._id = { $in: userIds };
    }

    // Get target user IDs
    const targetUsers = await User.find(userFilter).select('_id').lean();
    const targetUserIds = targetUsers.map(u => u._id);

    if (targetUserIds.length === 0) {
      return { sentCount: 0, deviceCount: 0 };
    }

    // Get active device tokens for these users
    const deviceTokens = await UserDeviceToken.find({
      userId: { $in: targetUserIds },
      isActive: true,
    }).select('token').lean();

    if (deviceTokens.length === 0) {
      return { sentCount: targetUserIds.length, deviceCount: 0 };
    }

    const tokens = deviceTokens.map(d => d.token);

    // Fire push notifications (non-blocking — don't await large batch errors)
    sendUserPushNotification(tokens, title, message).catch(() => null);

    return {
      sentCount: targetUserIds.length,
      deviceCount: tokens.length,
    };
  };
}
