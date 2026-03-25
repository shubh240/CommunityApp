import type { Request } from 'express';
import Otp from '@/models/mongoose/otp.model';
import { randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from '@/config';
import UserMongo from '@/models/mongoose/user.model';
import UserToken from '@/models/mongoose/userToken.model';
import { parseJwtExpires } from '@/utils/auth';
import { HttpException } from '@/exceptions/HttpException';
import { AUTH_MESSAGES } from '@/messages/auth.messages';
import { Document, Types } from 'mongoose';

export default class AuthRepo {
  constructor() { }

  readonly sendOtp = async (mobile: number): Promise<{ otp: number }> => {
    const otp = randomInt(100000, 999999);

    await Otp.findOneAndUpdate(
      { mobile },
      { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, // 5 mins expiry
      { upsert: true }
    );

    console.log(`OTP for ${mobile}: ${otp}`);

    // Optional: Send OTP via Twilio/AWS
    // await sendOtpSms(mobile, otp, 'twilio');

    return { otp };
  };

  readonly verifyOtp = async (
    mobile: number,
    otp: number,
    deviceInfo: { deviceId: string; platform: 'android' | 'ios' | 'web'; appVersion?: string }
  ): Promise<{ accessToken: string; refreshToken: string , user:any}> => {

    const otpRecord = await Otp.findOne({ mobile });
    console.log('otpRecord', otpRecord)
    console.log('OTP expiresAt UTC:', otpRecord.expiresAt.toISOString());
    console.log('Current UTC:', new Date().toISOString());

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

    const accessToken = jwt.sign({ userId: user._id, mobile: user.mobile }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES });
    const refreshToken = jwt.sign({ userId: user._id, mobile: user.mobile }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });

    const expiresAt = new Date(Date.now() + parseJwtExpires(JWT_REFRESH_EXPIRES));
    // Save or update user token for this device
    await UserToken.findOneAndUpdate(
      { userId: user._id, 'deviceInfo.deviceId': deviceInfo.deviceId },
      { accessToken, refreshToken, deviceInfo, expiresAt ,isRevoked: false },
      { upsert: true, new: true }
    );

    return { accessToken, refreshToken ,user };
  };

  readonly refreshToken = async (req: Request) => {
    const { refreshToken, deviceId } = req.body;

    if (!refreshToken || !deviceId) {
      throw new HttpException(401, 'Refresh token & deviceId required');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      );
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
      {
        userId: decoded.userId,
        role: 'USER',
      },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '30m' }
    );

    tokenDoc.accessToken = newAccessToken;
    await tokenDoc.save();

    return {
      accessToken: newAccessToken,
    };
  };

  readonly logout = async (
    userId: Types.ObjectId,
    deviceId: string
  ): Promise<void> => {
    await UserToken.findOneAndUpdate(
      {
        userId,
        'deviceInfo.deviceId': deviceId,
        isRevoked: false,
      },
      {
        isRevoked: true,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }
    );
  };
}
