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
import { getUserOnboardingStep } from '@/utils/user';

export default class AdminAuthRepo {
  readonly login = async (req: Request) => {
    const { mobile, password, deviceInfo } = req.body;

    // 1. Find admin
    const admin = await Admin.findOne({ mobile }).select('+password');
    console.log('admin',admin)
    if (!admin) {
      throw new HttpException(400, ADMIN_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!admin.isActive) {
      throw new HttpException(403, ADMIN_MESSAGES.ADMIN_BLOCKED);
    }
    console.log(admin , password)
    // 2. Verify password
    // const isMatch = await bcrypt.compare(password, admin.password);
    const isMatch = password === admin.password
    console.log('isMatch',isMatch)
    if (!isMatch) {
      throw new HttpException(400, ADMIN_MESSAGES.INVALID_CREDENTIALS);
    }

    // 3. Generate tokens
    const accessToken = jwt.sign(
      { adminId: admin._id },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { adminId: admin._id },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES }
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
    const {page,pageSize,kycStatus} = req.query

    const filter: any = {};

    if (kycStatus) {
      filter.kycStatus = kycStatus;
    }

    const skip = (Number(page) - 1) * Number(pageSize);

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


}
