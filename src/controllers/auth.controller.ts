import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import AuthRepo from '@/repository/auth.repository';
import { AUTH_MESSAGES } from '@/messages/auth.messages';

export class AuthController {
  constructor(private readonly authRepository: AuthRepo) { }

readonly sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mobile, deviceInfo } = req.body;

    const result = await this.authRepository.sendOtp(mobile);

    return generalResponse(res, result, AUTH_MESSAGES.OTP_SENT_SUCCESSFULLY, 'success', true);
  } catch (error: any) {
    next(error);
  }
};


  readonly verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mobile, otp ,deviceInfo} = req.body;

      const result = await this.authRepository.verifyOtp(mobile, otp,deviceInfo);

      return generalResponse(res, result, AUTH_MESSAGES.OTP_VERIFIED_SUCESSFULLY, 'success', true);
    } catch (error: any) {
      next(error);
    }
  };

  readonly refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.authRepository.refreshToken(req);
      return generalResponse(
        res,
        data,
        AUTH_MESSAGES.ACCESS_REFRESHED,
        'success'
      );
    } catch (err) {
      next(err);
    }

  };
  
  readonly logout = async (req: Request, res: Response) => {
    const userId = req.userTokenData._id
    const { deviceId } = req.body;

    await this.authRepository.logout(userId, deviceId);

    return generalResponse(res, {
      message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    });
  };


  // readonly adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const admin = await this.authRepository.adminLogin(req);

  //     return generalResponse(
  //       res,
  //       {
  //         access_token: this.authRepository.createAdminToken(admin),
  //         admin,
  //       },
  //       AUTH_MESSAGES.LOGIN_SUCCESS,
  //       'success',
  //       true,
  //     );
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // readonly registerUser = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const user = await this.authRepository.registerUser(req);

  //     return generalResponse(
  //       res,
  //       {
  //         access_token: this.authRepository.createUserToken(user),
  //         user,
  //       },
  //       AUTH_MESSAGES.REGISTER_SUCCESS,
  //       'success',
  //       true,
  //     );
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // readonly initUser = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { isRegistered, user } = await this.authRepository.initUser(req);

  //     return generalResponse(
  //       res,
  //       {
  //         ...(isRegistered
  //           ? {
  //               access_token: this.authRepository.createUserToken(user),
  //               user,
  //             }
  //           : {}),
  //         isRegistered,
  //       },
  //       AUTH_MESSAGES.LOGIN_SUCCESS,
  //       'success',
  //       isRegistered,
  //     );
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
