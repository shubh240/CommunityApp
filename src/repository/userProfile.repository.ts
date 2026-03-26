import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import User from '@/models/mongoose/user.model';
import Post from '@/models/mongoose/post.model';
import Follow from '@/models/mongoose/follow.model';
import Block from '@/models/mongoose/block.model';
import UserToken from '@/models/mongoose/userToken.model';
import UserDoc from '@/models/mongoose/userDoc.model';
import PostLike from '@/models/mongoose/postLike.model';
import PostComment from '@/models/mongoose/postComment.model';
import PostSaved from '@/models/mongoose/postSaved.model';
import PostMedia from '@/models/mongoose/postMedia.model';
import Story from '@/models/mongoose/story.model';
import StoryView from '@/models/mongoose/storyView.model';
import Notification from '@/models/mongoose/notification.model';

const PROFILE_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  PROFILE_STATS_FETCHED: 'Profile stats fetched successfully',
  ACCOUNT_DEACTIVATED: 'Account deactivated successfully',
  ACCOUNT_DELETED: 'Account and all associated data deleted successfully',
  CANNOT_VIEW_BLOCKED: 'You cannot view this profile',
};

export { PROFILE_MESSAGES };

export default class UserProfileRepo {
  constructor() {}

  // ─── Get User Profile Stats ─────────────────────────
  readonly getProfileStats = async (req: Request) => {
    const currentUserId = req.userTokenData._id;
    const { userId } = req.params;

    const targetUserId = userId || currentUserId;

    const user = await User.findById(targetUserId)
      .select('firstName lastName profileImage kycStatus isBlocked isActive')
      .lean();

    if (!user) throw new HttpException(404, PROFILE_MESSAGES.USER_NOT_FOUND);

    // Check if blocked
    if (targetUserId.toString() !== currentUserId.toString()) {
      const isBlocked = await Block.exists({
        $or: [
          { blockerId: currentUserId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: currentUserId },
        ],
      });
      if (isBlocked) throw new HttpException(403, PROFILE_MESSAGES.CANNOT_VIEW_BLOCKED);
    }

    const [postCount, followerCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId: targetUserId, isDeleted: false }),
      Follow.countDocuments({ receiverId: targetUserId, status: 'ACCEPTED' }),
      Follow.countDocuments({ requesterId: targetUserId, status: 'ACCEPTED' }),
    ]);

    // Follow status (if viewing another user's profile)
    let followStatus: string | null = null;
    let isBlockedByMe = false;
    if (targetUserId.toString() !== currentUserId.toString()) {
      const follow = await Follow.findOne({ requesterId: currentUserId, receiverId: targetUserId });
      followStatus = follow ? follow.status : null;

      const block = await Block.exists({ blockerId: currentUserId, blockedId: targetUserId });
      isBlockedByMe = !!block;
    }

    return {
      user,
      stats: {
        postCount,
        followerCount,
        followingCount,
      },
      ...(targetUserId.toString() !== currentUserId.toString() && {
        followStatus,
        isBlockedByMe,
      }),
    };
  };

  // ─── Deactivate Account ─────────────────────────────
  // Soft deactivate — user can reactivate by logging in again
  readonly deactivateAccount = async (req: Request) => {
    const userId = req.userTokenData._id;

    await User.findByIdAndUpdate(userId, { isActive: false });

    // Revoke all tokens
    await UserToken.updateMany({ userId }, { isRevoked: true });

    return { deactivated: true };
  };

  // ─── Delete Account (permanent) ─────────────────────
  // Hard delete all user data — irreversible
  readonly deleteAccount = async (req: Request) => {
    const userId = req.userTokenData._id;

    // Delete all user-related data in parallel
    await Promise.all([
      // Posts and related
      Post.updateMany({ userId }, { isDeleted: true }),
      PostMedia.updateMany({ postId: { $in: await Post.find({ userId }).distinct('_id') } }, { isDeleted: true }),
      PostLike.deleteMany({ userId }),
      PostComment.updateMany({ userId }, { isDeleted: true }),
      PostSaved.deleteMany({ userId }),

      // Stories
      Story.updateMany({ userId }, { isDeleted: true }),
      StoryView.deleteMany({ userId }),

      // Social
      Follow.deleteMany({ $or: [{ requesterId: userId }, { receiverId: userId }] }),
      Block.deleteMany({ $or: [{ blockerId: userId }, { blockedId: userId }] }),
      Notification.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),

      // Auth
      UserToken.deleteMany({ userId }),
      UserDoc.deleteMany({ userId }),
    ]);

    // Anonymize user record (keep for referential integrity but strip PII)
    await User.findByIdAndUpdate(userId, {
      firstName: 'Deleted',
      lastName: 'User',
      email: null,
      mobile: `deleted_${userId}_${Date.now()}`,
      profileImage: null,
      isActive: false,
      isBlocked: true,
    });

    return { deleted: true };
  };
}
