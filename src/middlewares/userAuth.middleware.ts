import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { AUTH_MESSAGES } from '@/messages/auth.messages';
import { JWT_SECRET } from '@/config';
import jwt from 'jsonwebtoken';
import { jwtPayloadUser } from '@/interfaces/request.interface';
import UserRepo from '@/repository/user.repository';
import { generalResponse } from '@/helper/common.helper';
import User from '@/models/mongoose/user.model';

const userAuthMiddleware = (unverified = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new HttpException(401, AUTH_MESSAGES.TOKEN_EXPIRED);
      }

      jwt.verify(token, JWT_SECRET, async (err, decoded: jwtPayloadUser) => {
        if (err) {
          return generalResponse(res, null, AUTH_MESSAGES.TOKEN_EXPIRED, 'error', true, 401);
        } else {
          const user = await User.findById(decoded.userId);
          if (!user) {
            return generalResponse(res, null, AUTH_MESSAGES.USER_NOT_FOUND, 'error', true, 401);
          }
          req.userTokenData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobile: user.mobile,
            block: user.isBlocked,
            isActive: user.isActive
          };
          next();
        }
      });
    } catch (error) {
      console.log('err----->',error)
      next(error);
    }
  };
};

export { userAuthMiddleware };
