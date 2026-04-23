import type { Request } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { randomInt } from 'crypto';
import { HttpException } from '@/exceptions/HttpException';
import { ADMIN_MESSAGES } from '@/messages/admin.messages';
import Admin from '@/models/mongoose/admin.model';
import AdminOtp from '@/models/mongoose/adminOtp.model';
import { sendOtpSms } from '@/utils/sendOtp';

export default class AdminProfileRepo {
  constructor() {}

  // ─── Get Admin Profile ────────────────────────────
  readonly getProfile = async (req: Request) => {
    const adminId = req.adminTokenData.adminId;

    const admin = await Admin.findById(adminId)
      .select('_id name email mobile profileImage isActive lastLoginAt createdAt')
      .lean();

    if (!admin) throw new HttpException(404, ADMIN_MESSAGES.ADMIN_NOT_FOUND);

    return admin;
  };

  // ─── Update Admin Profile ─────────────────────────
  readonly updateProfile = async (req: Request) => {
    const adminId = req.adminTokenData.adminId;
    const { name, email, profileImage } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) throw new HttpException(404, ADMIN_MESSAGES.ADMIN_NOT_FOUND);

    if (email !== undefined && email !== admin.email) {
      const existing = await Admin.findOne({ email, _id: { $ne: adminId } });
      if (existing) throw new HttpException(400, ADMIN_MESSAGES.EMAIL_ALREADY_EXISTS);
      admin.email = email;
    }

    if (name !== undefined) admin.name = name;
    if (profileImage !== undefined) admin.profileImage = profileImage;

    await admin.save();

    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      profileImage: admin.profileImage,
    };
  };

  // ─── Change Password (logged in) ──────────────────
  readonly changePassword = async (req: Request) => {
    const adminId = req.adminTokenData.adminId;
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) throw new HttpException(404, ADMIN_MESSAGES.ADMIN_NOT_FOUND);

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) throw new HttpException(400, ADMIN_MESSAGES.CURRENT_PASSWORD_WRONG);

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return { changed: true };
  };

  // ─── Forgot Password: Send OTP ─────────────────────
  readonly forgotPasswordSendOtp = async (req: Request) => {
    const { mobile } = req.body;

    const admin = await Admin.findOne({ mobile, isActive: true });
    if (!admin) throw new HttpException(404, ADMIN_MESSAGES.ADMIN_NOT_FOUND);

    // const otp = randomInt(100000, 999999);
    // Fixed OTP for testing phase
    const otp = 123456;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate any old active OTPs for this admin
    await AdminOtp.deleteMany({ adminId: admin._id });

    await AdminOtp.create({
      adminId: admin._id,
      mobile,
      otp,
      expiresAt,
    });

    // Send OTP via SMS in production, log in development
    if (process.env.NODE_ENV === 'production') {
      await sendOtpSms(String(mobile), String(otp));
    } else {
      console.log(`[DEV] Admin OTP for ${mobile}: ${otp}`);
    }

    return {};
  };

  // ─── Forgot Password: Verify OTP ───────────────────
  readonly forgotPasswordVerifyOtp = async (req: Request) => {
    const { mobile, otp } = req.body;

    const admin = await Admin.findOne({ mobile, isActive: true });
    if (!admin) throw new HttpException(404, ADMIN_MESSAGES.ADMIN_NOT_FOUND);

    const otpRecord = await AdminOtp.findOne({
      adminId: admin._id,
      otp,
      tokenUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) throw new HttpException(400, ADMIN_MESSAGES.OTP_INVALID);

    // Generate a one-time reset token, valid for 15 minutes
    const resetToken = crypto.randomBytes(32).toString('hex');
    otpRecord.resetToken = resetToken;
    otpRecord.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await otpRecord.save();

    return { resetToken };
  };

  // ─── Forgot Password: Reset Password ───────────────
  readonly forgotPasswordReset = async (req: Request) => {
    const { resetToken, newPassword } = req.body;

    const otpRecord = await AdminOtp.findOne({
      resetToken,
      tokenUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) throw new HttpException(400, ADMIN_MESSAGES.RESET_TOKEN_INVALID);

    const admin = await Admin.findById(otpRecord.adminId);
    if (!admin) throw new HttpException(404, ADMIN_MESSAGES.ADMIN_NOT_FOUND);

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    otpRecord.tokenUsed = true;
    await otpRecord.save();

    return { reset: true };
  };
}
