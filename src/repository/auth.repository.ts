import type { Request } from 'express';
import Otp from '@/models/mongoose/otp.model';
import { randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from '@/config';
import UserMongo from '@/models/mongoose/user.model';
import UserDoc from '@/models/mongoose/userDoc.model';
import UserToken from '@/models/mongoose/userToken.model';
import { parseJwtExpires } from '@/utils/auth';
import { HttpException } from '@/exceptions/HttpException';
import { AUTH_MESSAGES } from '@/messages/auth.messages';
import { sendOtpSms } from '@/utils/sendOtp';
import { Types } from 'mongoose';

/*
  Navigation screen values frontend uses for routing:
  - PERSONAL_INFO   → onboarding step 1 (new user)
  - ADDRESS_PROOF   → onboarding step 2
  - EDUCATION_PROOF → onboarding step 3
  - OTHER_DOC       → onboarding step 4
  - UNDER_REVIEW    → KYC submitted, waiting admin review
  - REJECTED        → admin rejected one or more docs (includes rejectedDocs list)
  - HOME            → KYC approved, go to home
*/
const getNavigationScreen = (onboardingStep: number, kycStatus: string) => {
  if (kycStatus === 'APPROVED') return 'HOME';
  if (kycStatus === 'UNDER_REVIEW') return 'UNDER_REVIEW';
  if (kycStatus === 'REJECTED') return 'REJECTED';

  const stepScreenMap: Record<number, string> = {
    1: 'PERSONAL_INFO',
    2: 'ADDRESS_PROOF',
    3: 'EDUCATION_PROOF',
    4: 'OTHER_DOC',
    5: 'UNDER_REVIEW',
  };
  return stepScreenMap[onboardingStep] ?? 'PERSONAL_INFO';
};

export default class AuthRepo {
  constructor() { }

  readonly sendOtp = async (mobile: number): Promise<{}> => {
    const otp = randomInt(100000, 999999);

    await Otp.findOneAndUpdate(
      { mobile },
      { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true }
    );

    // Send OTP via SMS in production, log in development
    if (process.env.NODE_ENV === 'production') {
      await sendOtpSms(String(mobile), String(otp));
    } else {
      console.log(`[DEV] OTP for ${mobile}: ${otp}`);
    }

    return {};
  };

  readonly verifyOtp = async (
    mobile: number,
    otp: number,
    deviceInfo: { deviceId: string; platform: 'android' | 'ios' | 'web'; appVersion?: string }
  ) => {
    const otpRecord = await Otp.findOne({ mobile });

    if (!otpRecord) throw new HttpException(400, AUTH_MESSAGES.OTP_NOT_FOUND_REQ_NEW_ONE);
    if (new Date(otpRecord.expiresAt).getTime() < Date.now())
      throw new HttpException(400, AUTH_MESSAGES.OTP_EXPIRED_REQ_NEW_ONE);
    if (otpRecord.otp !== otp) throw new HttpException(400, AUTH_MESSAGES.INVALID_OTP);

    await Otp.deleteOne({ mobile });

    let user = await UserMongo.findOne({ mobile });
    if (!user) {
      user = new UserMongo({ mobile, isActive: true });
      await user.save();
    }

    const accessToken = jwt.sign(
      { userId: user._id, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES }
    );
    const refreshToken = jwt.sign(
      { userId: user._id, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES }
    );

    const expiresAt = new Date(Date.now() + parseJwtExpires(JWT_REFRESH_EXPIRES));
    await UserToken.findOneAndUpdate(
      { userId: user._id, 'deviceInfo.deviceId': deviceInfo.deviceId },
      { accessToken, refreshToken, deviceInfo, expiresAt, isRevoked: false },
      { upsert: true, new: true }
    );

    // Build navigation — include rejected docs so frontend can show per-doc status
    const screen = getNavigationScreen(user.onboardingStep, user.kycStatus);
    let rejectedDocs: any[] = [];
    if (user.kycStatus === 'REJECTED') {
      rejectedDocs = await UserDoc.find({ userId: user._id, isActive: true })
        .select('type documentName status rejectionReason')
        .lean();
    }

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profileImage,
        onboardingStep: user.onboardingStep,
        kycStatus: user.kycStatus,
      },
      navigation: {
        screen,
        ...(rejectedDocs.length > 0 && { rejectedDocs }),
      },
    };
  };

  readonly refreshToken = async (req: Request) => {
    const { refreshToken, deviceId } = req.body;

    if (!refreshToken || !deviceId) {
      throw new HttpException(401, 'Refresh token & deviceId required');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch {
      throw new HttpException(401, 'Invalid refresh token');
    }

    const tokenDoc = await UserToken.findOne({
      userId: decoded.userId,
      refreshToken,
      'deviceInfo.deviceId': deviceId,
      isRevoked: false,
    });

    if (!tokenDoc) {
      throw new HttpException(401, 'Session expired, please login again');
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, mobile: decoded.mobile },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES }
    );

    tokenDoc.accessToken = newAccessToken;
    await tokenDoc.save();

    return { accessToken: newAccessToken };
  };

  readonly logout = async (
    userId: Types.ObjectId,
    deviceId: string
  ): Promise<void> => {
    await UserToken.findOneAndUpdate(
      { userId, 'deviceInfo.deviceId': deviceId, isRevoked: false },
      { isRevoked: true, accessToken: null, refreshToken: null, expiresAt: null }
    );
  };
}
