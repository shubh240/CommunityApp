import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import Block from '@/models/mongoose/block.model';
import Follow from '@/models/mongoose/follow.model';
import User from '@/models/mongoose/user.model';

const BLOCK_MESSAGES = {
  BLOCKED: 'User blocked successfully',
  UNBLOCKED: 'User unblocked successfully',
  ALREADY_BLOCKED: 'User is already blocked',
  NOT_BLOCKED: 'User is not blocked',
  CANNOT_BLOCK_SELF: 'You cannot block yourself',
  BLOCKED_USERS_FETCHED: 'Blocked users fetched successfully',
  USER_NOT_FOUND: 'User not found',
};

export { BLOCK_MESSAGES };

export default class BlockRepo {
  constructor() {}

  // ─── Block User ─────────────────────────────────────
  readonly blockUser = async (req: Request) => {
    const blockerId = req.userTokenData._id;
    const blockedId = req.params.userId as string;

    if (blockerId.toString() === blockedId) {
      throw new HttpException(400, BLOCK_MESSAGES.CANNOT_BLOCK_SELF);
    }

    const user = await User.findById(blockedId);
    if (!user) throw new HttpException(404, BLOCK_MESSAGES.USER_NOT_FOUND);

    const existing = await Block.findOne({ blockerId, blockedId });
    if (existing) throw new HttpException(400, BLOCK_MESSAGES.ALREADY_BLOCKED);

    await Block.create({ blockerId, blockedId });

    // Remove any follow relationships in both directions
    await Follow.deleteMany({
      $or: [
        { requesterId: blockerId, receiverId: blockedId },
        { requesterId: blockedId, receiverId: blockerId },
      ],
    });

    return { blocked: true };
  };

  // ─── Unblock User ───────────────────────────────────
  readonly unblockUser = async (req: Request) => {
    const blockerId = req.userTokenData._id;
    const { userId: blockedId } = req.params;

    const block = await Block.findOne({ blockerId, blockedId });
    if (!block) throw new HttpException(400, BLOCK_MESSAGES.NOT_BLOCKED);

    await Block.deleteOne({ _id: block._id });

    return { unblocked: true };
  };

  // ─── Get Blocked Users ──────────────────────────────
  readonly getBlockedUsers = async (req: Request) => {
    const blockerId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const total = await Block.countDocuments({ blockerId });
    const blocks = await Block.find({ blockerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('blockedId', 'firstName lastName profileImage')
      .lean();

    return {
      blockedUsers: blocks.map(b => b.blockedId),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Helper: Get blocked user IDs for a user ───────
  // Used by other repos to filter out blocked users
  static readonly getBlockedIds = async (userId: any): Promise<string[]> => {
    const blocks = await Block.find({
      $or: [{ blockerId: userId }, { blockedId: userId }],
    }).select('blockerId blockedId').lean();

    const blockedIds = new Set<string>();
    blocks.forEach(b => {
      if (b.blockerId.toString() === userId.toString()) {
        blockedIds.add(b.blockedId.toString());
      } else {
        blockedIds.add(b.blockerId.toString());
      }
    });

    return Array.from(blockedIds);
  };
}
