import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '@/models/mongoose/admin.model';
import AdminToken from '@/models/mongoose/adminToken.model';
import { HttpException } from '@/exceptions/HttpException';
import { JWT_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from '@/config';
import { parseJwtExpires } from '@/utils/auth';
import { Request } from 'express';
import { ADMIN_MESSAGES } from '@/messages/admin.messages';
import User from '@/models/mongoose/user.model';
import UserDoc from '@/models/mongoose/userDoc.model';
import MatrimonialProfile from '@/models/mongoose/matrimonialProfile.model';
import { sendNotification } from '@/helper/pushNotification.helper';

export default class AdminAuthRepo {
  readonly login = async (req: Request) => {
    const { mobile, password, deviceInfo } = req.body;

    // 1. Find admin
    const admin = await Admin.findOne({ mobile }).select('+password');
    if (!admin) {
      throw new HttpException(400, ADMIN_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!admin.isActive) {
      throw new HttpException(403, ADMIN_MESSAGES.ADMIN_BLOCKED);
    }
    // 2. Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new HttpException(400, ADMIN_MESSAGES.INVALID_CREDENTIALS);
    }

    // 3. Generate tokens
    // Cast needed: JWT_ACCESS_EXPIRES is string from env but jsonwebtoken types expect StringValue
    const accessToken = jwt.sign(
      { adminId: admin._id },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES as any }
    );

    const refreshToken = jwt.sign(
      { adminId: admin._id },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES as any }
    );

    const expiresAt = new Date(Date.now() + parseJwtExpires(JWT_REFRESH_EXPIRES));

    await AdminToken.findOneAndUpdate(
      {
        adminId: admin._id,
        'deviceInfo.deviceId': deviceInfo.deviceId,
      },
      {
        adminId: admin._id,
        accessToken,
        refreshToken,
        deviceInfo,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    admin.lastLoginAt = new Date();
    await admin.save();

    return {
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email
        },
        accessToken,
        refreshToken,
        };

  };

  readonly listSubmittedKycUsers = async (req: Request) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const { kycStatus } = req.query;

    const filter: any = {};

    if (kycStatus) {
      filter.kycStatus = kycStatus;
    }

    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('_id name email mobile kycStatus onboardingStep createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),

      User.countDocuments(filter),
    ]);

    const userIds = users.map(u => u._id);

    const docs = await UserDoc.find({
      userId: { $in: userIds },
      isActive: true,
    }).lean();

    const userDocsMap = docs.reduce((acc, doc) => {
      const userId = doc.userId.toString();

      acc[userId] = acc[userId] || [];
      acc[userId].push(doc);

      return acc;
    }, {} as Record<string, typeof docs>);

    const result = users.map(user => ({
      ...user,
      documents: userDocsMap[user._id.toHexString()] || [],
    }));

    return {
      count : total,
      data: result
    };
  };

  readonly reviewUserDocument = async (req: Request) => {
    const { userId, docId, action, rejectionReason } = req.body;
    const adminId = req.adminTokenData.adminId;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      throw new HttpException(400, ADMIN_MESSAGES.INVALID_ACTION);
    }

    const updateDoc: any = {
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };

    if (action === 'APPROVED') {
      updateDoc.status = 'APPROVED';
      updateDoc.rejectionReason = null;
    } else {
      updateDoc.status = 'REJECTED';
      updateDoc.rejectionReason =
        rejectionReason || ADMIN_MESSAGES.REJECTED_BY_ADMIN;
    }

    const doc = await UserDoc.findOneAndUpdate(
      { _id: docId, userId },
      updateDoc,
      { new: true }
    );

    if (!doc) {
      throw new HttpException(400, ADMIN_MESSAGES.DOC_NOT_FOUND);
    }

    if (action === 'REJECTED') {
      await User.findByIdAndUpdate(userId, {
        kycStatus: 'REJECTED',
      });

      return {
        message: ADMIN_MESSAGES.DOC_REJECTED,
        doc,
      };
    }

    const REQUIRED_DOC_TYPES = ['ADDRESS_PROOF', 'EDUCATION_PROOF', 'OTHER'];

    const approvedCount = await UserDoc.countDocuments({
      userId,
      type: { $in: REQUIRED_DOC_TYPES },
      status: 'APPROVED',
      isActive: true,
    });

    if (approvedCount === REQUIRED_DOC_TYPES.length) {
      await User.findByIdAndUpdate(userId, {
        kycStatus: 'APPROVED',
      });
    }

    return {
      message: ADMIN_MESSAGES.DOC_APPROVED,
      doc,
    };
  };

  // ─── List Matrimonial Profiles for Review ───────────
  readonly listMatrimonialProfiles = async (req: Request) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const status = (req.query.status as string) || 'UNDER_REVIEW';

    const filter: any = { status, isActive: true };
    const skip = (page - 1) * pageSize;

    const [profiles, total] = await Promise.all([
      MatrimonialProfile.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('userId', 'firstName lastName mobile email profileImage')
        .populate('createdForUserId', 'firstName lastName relation')
        .lean(),
      MatrimonialProfile.countDocuments(filter),
    ]);

    return { count: total, data: profiles };
  };

  // ─── Review Matrimonial Profile ─────────────────────
  readonly reviewMatrimonialProfile = async (req: Request) => {
    const adminId = req.adminTokenData.adminId;
    const { profileId, action, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      throw new HttpException(400, ADMIN_MESSAGES.INVALID_ACTION);
    }

    const profile = await MatrimonialProfile.findOne({ _id: profileId, isActive: true });
    if (!profile) throw new HttpException(404, 'Matrimonial profile not found');

    if (profile.status !== 'UNDER_REVIEW') {
      throw new HttpException(400, 'Only profiles under review can be reviewed');
    }

    profile.status = action;
    profile.reviewedBy = adminId as any;
    profile.reviewedAt = new Date();

    if (action === 'REJECTED') {
      profile.rejectionReason = rejectionReason || 'Rejected by admin';
    }

    await profile.save();

    // Notify the profile owner
    await sendNotification({
      receiverId: profile.userId,
      type: action === 'APPROVED' ? 'MATRIMONIAL_INTEREST_ACCEPTED' : 'MATRIMONIAL_INTEREST_REJECTED',
      referenceId: profile._id,
      title: action === 'APPROVED' ? 'Profile Approved' : 'Profile Rejected',
      message: action === 'APPROVED'
        ? `Your matrimonial profile for ${profile.firstName} has been approved`
        : `Your matrimonial profile for ${profile.firstName} was rejected: ${profile.rejectionReason}`,
    });

    return { message: `Profile ${action.toLowerCase()}`, profile };
  };
}
