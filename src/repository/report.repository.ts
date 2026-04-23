import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import Report from '@/models/mongoose/report.model';
import Post from '@/models/mongoose/post.model';
import PostComment from '@/models/mongoose/postComment.model';
import User from '@/models/mongoose/user.model';

const REPORT_MESSAGES = {
  REPORTED: 'Report submitted successfully',
  ALREADY_REPORTED: 'You have already reported this',
  POST_NOT_FOUND: 'Post not found',
  USER_NOT_FOUND: 'User not found',
  COMMENT_NOT_FOUND: 'Comment not found',
  CANNOT_REPORT_SELF: 'You cannot report yourself',
};

export { REPORT_MESSAGES };

export default class ReportRepo {
  constructor() {}

  // ─── Report Post ────────────────────────────────────
  readonly reportPost = async (req: Request) => {
    const reporterId = req.userTokenData._id;
    const { postId } = req.params;
    const { reason, description } = req.body;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new HttpException(404, REPORT_MESSAGES.POST_NOT_FOUND);

    if (post.userId.toString() === reporterId.toString()) {
      throw new HttpException(400, REPORT_MESSAGES.CANNOT_REPORT_SELF);
    }

    // Check duplicate report
    const existing = await Report.findOne({ reporterId, type: 'POST', referenceId: postId });
    if (existing) throw new HttpException(400, REPORT_MESSAGES.ALREADY_REPORTED);

    await Report.create({
      reporterId,
      reportedId: post.userId,
      type: 'POST',
      referenceId: post._id,
      reason,
      description,
    });

    return { reported: true };
  };

  // ─── Report User ────────────────────────────────────
  readonly reportUser = async (req: Request) => {
    const reporterId = req.userTokenData._id;
    const userId = req.params.userId as string;
    const { reason, description } = req.body;

    if (reporterId.toString() === userId) {
      throw new HttpException(400, REPORT_MESSAGES.CANNOT_REPORT_SELF);
    }

    const user = await User.findById(userId);
    if (!user) throw new HttpException(404, REPORT_MESSAGES.USER_NOT_FOUND);

    const existing = await Report.findOne({ reporterId, type: 'USER', reportedId: userId });
    if (existing) throw new HttpException(400, REPORT_MESSAGES.ALREADY_REPORTED);

    await Report.create({
      reporterId,
      reportedId: userId,
      type: 'USER',
      reason,
      description,
    });

    return { reported: true };
  };

  // ─── Report Comment ─────────────────────────────────
  readonly reportComment = async (req: Request) => {
    const reporterId = req.userTokenData._id;
    const { commentId } = req.params;
    const { reason, description } = req.body;

    const comment = await PostComment.findOne({ _id: commentId, isDeleted: false });
    if (!comment) throw new HttpException(404, REPORT_MESSAGES.COMMENT_NOT_FOUND);

    if (comment.userId.toString() === reporterId.toString()) {
      throw new HttpException(400, REPORT_MESSAGES.CANNOT_REPORT_SELF);
    }

    const existing = await Report.findOne({ reporterId, type: 'COMMENT', referenceId: commentId });
    if (existing) throw new HttpException(400, REPORT_MESSAGES.ALREADY_REPORTED);

    await Report.create({
      reporterId,
      reportedId: comment.userId,
      type: 'COMMENT',
      referenceId: comment._id,
      reason,
      description,
    });

    return { reported: true };
  };
}
