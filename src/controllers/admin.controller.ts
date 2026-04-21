import { Request, Response, NextFunction } from 'express';
import { generalResponse } from '@/helper/common.helper';
import AdminAuthRepo from '@/repository/admin.repository';
import { ADMIN_MESSAGES } from '@/messages/admin.messages';

export class AdminAuthController {
  constructor(private readonly repo: AdminAuthRepo) {}

  readonly register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.register(req);
      return generalResponse(res, data, ADMIN_MESSAGES.REGISTER_SUCCESS, 'success', false, 201);
    } catch (error) {
      next(error);
    }
  };

  readonly login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.login(req);
      return generalResponse(res, data,ADMIN_MESSAGES.LOGIN_SUCCESS, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly listSubmittedKycUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.repo.listSubmittedKycUsers(req);
      return generalResponse(
        res,
        data,
        ADMIN_MESSAGES.LIST_SUBMITTED_KYC,
        'success'
      );
    } catch (error) {
      next(error);
    }
  };

  readonly reviewUserDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.repo.reviewUserDocument(req);
      return generalResponse(res, data.doc, data.message, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly listMatrimonialProfiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.repo.listMatrimonialProfiles(req);
      return generalResponse(res, data, 'Matrimonial profiles fetched', 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly reviewMatrimonialProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.repo.reviewMatrimonialProfile(req);
      return generalResponse(res, data.profile, data.message, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.refreshToken(req);
      return generalResponse(res, data, ADMIN_MESSAGES.ACCESS_REFRESHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.adminTokenData.adminId;
      const { deviceId } = req.body;
      await this.repo.logout(adminId, deviceId);
      return generalResponse(res, null, ADMIN_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      next(error);
    }
  };
}
