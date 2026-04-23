import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { ADMIN_MESSAGES } from '@/messages/admin.messages';
import User from '@/models/mongoose/user.model';
import UserToken from '@/models/mongoose/userToken.model';
import UserDeviceToken from '@/models/mongoose/userDeviceToken.model';
import Post from '@/models/mongoose/post.model';
import Follow from '@/models/mongoose/follow.model';

export default class AdminUserRepo {
  constructor() {}

  // ─── List All Users (with filters) ────────────────
  readonly listUsers = async (req: Request) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const { status, kycStatus, isBlocked, isActive, q } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (kycStatus) filter.kycStatus = kycStatus;
    if (isBlocked !== undefined) filter.isBlocked = String(isBlocked) === 'true';
    if (isActive !== undefined) filter.isActive = String(isActive) === 'true';
    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('_id firstName lastName mobile email profileImage status kycStatus isBlocked isActive createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get User Detail ──────────────────────────────
  readonly getUser = async (req: Request) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-__v')
      .lean();

    if (!user) throw new HttpException(404, ADMIN_MESSAGES.USER_NOT_FOUND);

    return user;
  };

  // ─── Block User (revoke tokens, deactivate FCM) ───
  readonly blockUser = async (req: Request) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new HttpException(404, ADMIN_MESSAGES.USER_NOT_FOUND);

    user.isBlocked = true;
    await user.save();

    // Revoke all user tokens (force logout from all devices)
    await UserToken.updateMany({ userId }, { isRevoked: true });

    // Deactivate FCM device tokens (no more push notifications)
    await UserDeviceToken.updateMany({ userId }, { isActive: false });

    return { blocked: true };
  };

  // ─── Unblock User ─────────────────────────────────
  readonly unblockUser = async (req: Request) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new HttpException(404, ADMIN_MESSAGES.USER_NOT_FOUND);

    user.isBlocked = false;
    await user.save();

    // Note: We do NOT auto-reactivate tokens. User must login again.
    // We DO reactivate device tokens so they can receive push notifications on next login.
    await UserDeviceToken.updateMany({ userId }, { isActive: true });

    return { unblocked: true };
  };

  // ─── Soft Delete User (anonymize + revoke) ────────
  readonly deleteUser = async (req: Request) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new HttpException(404, ADMIN_MESSAGES.USER_NOT_FOUND);

    // Anonymize user record
    user.firstName = 'Deleted';
    user.lastName = 'User';
    user.email = undefined;
    user.mobile = `deleted_${user._id}_${Date.now()}` as any;
    user.profileImage = undefined;
    user.isActive = false;
    user.isBlocked = true;
    await user.save();

    // Revoke all tokens
    await UserToken.deleteMany({ userId });
    await UserDeviceToken.updateMany({ userId }, { isActive: false });

    return { deleted: true };
  };

  // ─── Get User Stats ───────────────────────────────
  readonly getUserStats = async (req: Request) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select('_id firstName lastName profileImage').lean();
    if (!user) throw new HttpException(404, ADMIN_MESSAGES.USER_NOT_FOUND);

    const [postCount, followerCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId, isDeleted: false }),
      Follow.countDocuments({ receiverId: userId, status: 'ACCEPTED' }),
      Follow.countDocuments({ requesterId: userId, status: 'ACCEPTED' }),
    ]);

    return {
      user,
      stats: {
        postCount,
        followerCount,
        followingCount,
      },
    };
  };
}
