import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { AUTH_MESSAGES } from '@/messages/auth.messages';
import { RESPONSIBILITY } from '@/models/mongoose/interfaces/admin.model.interface';

const isNationalAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.adminTokenData.responsibility !== RESPONSIBILITY.NATIONAL) {
    throw new HttpException(401, AUTH_MESSAGES.PERMISSION_DENIED);
  }

  next();
};

export { isNationalAdmin };
