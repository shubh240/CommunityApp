import type { NextFunction, Request, Response } from 'express';
import UserRepo from '@/repository/user.repository';
import { generalResponse } from '@/helper/common.helper';
import { USER_MESSAGES } from '@/messages/user.messages';
import User from '@/models/mongoose/user.model';
import { HttpException } from '@/exceptions/HttpException';

export class UserController {
  constructor(private readonly userRepository: UserRepo) {}

  readonly completeProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userRepository.completeProfile(req);
      return generalResponse(res, user, USER_MESSAGES.PROFILE_COMPLETED, 'success', false);
    } catch (error) {
      next(error);
    }
  };

  readonly uploadUserDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepository.uploadUserDocument(req);
      return generalResponse(res, data.user, data.message, 'success', false);
    } catch (error) {
      next(error);
    }
  };

  readonly reUploadUserDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepository.reUploadUserDocument(req);
      return generalResponse(res, data.user, data.message, 'success', false);
    } catch (error) {
      next(error);
    }
  };

  readonly getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepository.getMe(req);
      return generalResponse(res, data, USER_MESSAGES.USER_FETCHED, 'success', false);
    } catch (error) {
      next(error);
    }
  };
}
