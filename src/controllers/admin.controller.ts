import { Request, Response, NextFunction } from 'express';
import { generalResponse } from '@/helper/common.helper';
import AdminAuthRepo from '@/repository/admin.repository';
import { ADMIN_MESSAGES } from '@/messages/admin.messages';

export class AdminAuthController {
  constructor(private readonly repo: AdminAuthRepo) {}

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

}
