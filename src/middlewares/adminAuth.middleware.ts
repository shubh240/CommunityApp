import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/config';
import AdminToken from '@/models/mongoose/adminToken.model';
import { HttpException } from '@/exceptions/HttpException';
import { AUTH_MESSAGES } from '@/messages/auth.messages';

const adminAuthMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      console.log('token',token)
      if (!token) {
        throw new HttpException(401, AUTH_MESSAGES.TOKEN_EXPIRED);
      }

      // const token = authHeader.split(' ')[1];

      // 1. Verify JWT
      const decoded: any = jwt.verify(token, JWT_SECRET);

      if (!decoded?.adminId) {
        throw new HttpException(401, 'Invalid admin token');
      }

      // 2. Check token exists in DB
      const adminToken = await AdminToken.findOne({
        adminId: decoded.adminId,
        accessToken: token,
        expiresAt: { $gt: new Date() },
      });

      if (!adminToken) {
        throw new HttpException(401, 'Session expired, please login again');
      }

      // 3. Attach admin to request
      req.adminTokenData = {
        adminId: decoded.adminId
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { adminAuthMiddleware };