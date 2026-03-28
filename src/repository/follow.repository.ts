import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { POST_MESSAGES } from '@/messages/post.messages';
import Follow from '@/models/mongoose/follow.model';
import User from '@/models/mongoose/user.model';
import Block from '@/models/mongoose/block.model';
import { sendNotification } from '@/helper/pushNotification.helper';

export default class FollowRepo {
  constructor() {}

  // ─── Send Follow Request ────────────────────────────
  readonly sendFollowRequest = async (req: Request) => {
    const requesterId = req.userTokenData._id;
    const { userId: receiverId } = req.params;

    if (requesterId.toString() === receiverId) {
      throw new HttpException(400, POST_MESSAGES.CANNOT_FOLLOW_SELF);
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) throw new HttpException(404, 'User not found');

    // Check if either user has blocked the other
    const isBlocked = await Block.exists({
      $or: [
        { blockerId: requesterId, blockedId: receiverId },
        { blockerId: receiverId, blockedId: requesterId },
      ],
    });
    if (isBlocked) throw new HttpException(403, 'Cannot follow this user');

    // Check if already exists
    const existing = await Follow.findOne({ requesterId, receiverId });
    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new HttpException(400, POST_MESSAGES.ALREADY_FOLLOWING);
      }
      if (existing.status === 'PENDING') {
        throw new HttpException(400, 'Follow request already sent');
      }
      // If REJECTED, allow re-request
      existing.status = 'PENDING';
      await existing.save();
    } else {
      await Follow.create({ requesterId, receiverId });
    }

    // Notify receiver
    await sendNotification({
      senderId: requesterId,
      receiverId,
      type: 'FOLLOW_REQUEST',
      title: 'Follow Request',
      message: 'sent you a follow request',
    });

    return { status: 'PENDING' };
  };

  // ─── Accept / Reject Follow Request ─────────────────
  readonly respondToFollowRequest = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { requestId, action } = req.body;

    const follow = await Follow.findOne({ _id: requestId, receiverId: userId, status: 'PENDING' });
    if (!follow) throw new HttpException(404, POST_MESSAGES.FOLLOW_NOT_FOUND);

    follow.status = action; // 'ACCEPTED' or 'REJECTED'
    await follow.save();

    if (action === 'ACCEPTED') {
      await sendNotification({
        senderId: userId,
        receiverId: follow.requesterId,
        type: 'FOLLOW_ACCEPTED',
        title: 'Follow Accepted',
        message: 'accepted your follow request',
      });
    }

    return { status: follow.status };
  };

  // ─── Unfollow ───────────────────────────────────────
  readonly unfollow = async (req: Request) => {
    const requesterId = req.userTokenData._id;
    const { userId: receiverId } = req.params;

    const follow = await Follow.findOne({ requesterId, receiverId });
    if (!follow) throw new HttpException(404, POST_MESSAGES.FOLLOW_NOT_FOUND);

    await Follow.deleteOne({ _id: follow._id });

    return { unfollowed: true };
  };

  // ─── Remove Follower (remove someone from your followers) ──
  readonly removeFollower = async (req: Request) => {
    const userId = req.userTokenData._id; // current user (receiver)
    const { userId: followerId } = req.params; // the follower to remove

    const follow = await Follow.findOne({ requesterId: followerId, receiverId: userId, status: 'ACCEPTED' });
    if (!follow) throw new HttpException(404, POST_MESSAGES.FOLLOW_NOT_FOUND);

    await Follow.deleteOne({ _id: follow._id });

    return { removed: true };
  };

  // ─── Get Followers ──────────────────────────────────
  readonly getFollowers = async (req: Request) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const targetUserId = userId || req.userTokenData._id;

    const total = await Follow.countDocuments({ receiverId: targetUserId, status: 'ACCEPTED' });
    const followers = await Follow.find({ receiverId: targetUserId, status: 'ACCEPTED' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('requesterId', 'firstName lastName profileImage')
      .lean();

    return {
      followers: followers.map(f => f.requesterId),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get Following ─────────────────────────────────
  readonly getFollowing = async (req: Request) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const targetUserId = userId || req.userTokenData._id;

    const total = await Follow.countDocuments({ requesterId: targetUserId, status: 'ACCEPTED' });
    const following = await Follow.find({ requesterId: targetUserId, status: 'ACCEPTED' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('receiverId', 'firstName lastName profileImage')
      .lean();

    return {
      following: following.map(f => f.receiverId),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get Pending Follow Requests (received) ─────────
  readonly getFollowRequests = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const total = await Follow.countDocuments({ receiverId: userId, status: 'PENDING' });
    const requests = await Follow.find({ receiverId: userId, status: 'PENDING' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('requesterId', 'firstName lastName profileImage')
      .lean();

    return {
      requests,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };
}
