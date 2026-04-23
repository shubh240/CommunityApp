import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { ADMIN_MESSAGES } from '@/messages/admin.messages';
import Report from '@/models/mongoose/report.model';
import Post from '@/models/mongoose/post.model';
import PostComment from '@/models/mongoose/postComment.model';
import User from '@/models/mongoose/user.model';
import UserToken from '@/models/mongoose/userToken.model';
import UserDeviceToken from '@/models/mongoose/userDeviceToken.model';
import { sendNotification } from '@/helper/pushNotification.helper';

export default class AdminReportRepo {
  constructor() {}

  // ─── List All Reports ─────────────────────────────
  readonly listReports = async (req: Request) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const { type, status } = req.query;

    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * pageSize;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('reporterId', 'firstName lastName profileImage')
        .populate('reportedId', 'firstName lastName profileImage')
        .populate('reviewedBy', 'name email')
        .lean(),
      Report.countDocuments(filter),
    ]);

    return {
      reports,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get Report Detail (with reported content) ────
  readonly getReport = async (req: Request) => {
    const { reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate('reporterId', 'firstName lastName profileImage')
      .populate('reportedId', 'firstName lastName profileImage')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!report) throw new HttpException(404, ADMIN_MESSAGES.REPORT_NOT_FOUND);

    // Attach reported content based on type
    let content: any = null;
    if (report.type === 'POST' && report.referenceId) {
      content = await Post.findById(report.referenceId)
        .populate('userId', 'firstName lastName profileImage')
        .lean();
    } else if (report.type === 'COMMENT' && report.referenceId) {
      content = await PostComment.findById(report.referenceId)
        .populate('userId', 'firstName lastName profileImage')
        .lean();
    } else if (report.type === 'USER') {
      content = await User.findById(report.reportedId)
        .select('firstName lastName email mobile profileImage isBlocked')
        .lean();
    }

    return { ...report, content };
  };

  // ─── Take Action on Report ────────────────────────
  readonly takeAction = async (req: Request) => {
    const adminId = req.adminTokenData.adminId;
    const { reportId } = req.params;
    const { action, note } = req.body;

    const report = await Report.findById(reportId);
    if (!report) throw new HttpException(404, ADMIN_MESSAGES.REPORT_NOT_FOUND);

    switch (action) {
      case 'DISMISS':
        report.status = 'DISMISSED';
        break;

      case 'DELETE_CONTENT':
        if (report.type === 'POST' && report.referenceId) {
          await Post.findByIdAndUpdate(report.referenceId, { isDeleted: true });
        } else if (report.type === 'COMMENT' && report.referenceId) {
          await PostComment.findByIdAndUpdate(report.referenceId, { isDeleted: true });
        }
        report.status = 'REVIEWED';
        break;

      case 'WARN_USER':
        await sendNotification({
          receiverId: report.reportedId,
          type: 'POST_LIKE', // reuse existing type; ideally add WARNING type
          title: 'Warning from Admin',
          message: note || 'You have received a warning. Please follow our community guidelines.',
        });
        report.status = 'REVIEWED';
        break;

      case 'BAN_USER':
        await User.findByIdAndUpdate(report.reportedId, { isBlocked: true });
        await UserToken.updateMany({ userId: report.reportedId }, { isRevoked: true });
        await UserDeviceToken.updateMany({ userId: report.reportedId }, { isActive: false });
        report.status = 'REVIEWED';
        break;

      default:
        throw new HttpException(400, ADMIN_MESSAGES.INVALID_ACTION);
    }

    report.reviewedBy = adminId as any;
    report.reviewedAt = new Date();
    await report.save();

    return { action, status: report.status };
  };
}
