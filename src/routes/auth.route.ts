import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { AuthController } from '@/controllers/auth.controller';
import AuthRepo from '@/repository/auth.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { logoutSchema, refreshTokenSchema, sendOtpSchema, verifyOtpSchema } from '@/validationSchema/auth.validation.schema';
import { userAuthMiddleware } from '@/middlewares/userAuth.middleware';

class AuthRoute implements Routes {
  public authPath = '/user/auth';
  public router = Router();
  public authController = new AuthController(new AuthRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.authPath}/sendOtp`,
      validationMiddleware(sendOtpSchema, 'body'),
      this.authController.sendOtp,
    );

    this.router.post(
      `${this.authPath}/verifyOtp`,
      validationMiddleware(verifyOtpSchema, 'body'),
      this.authController.verifyOtp
    );

    this.router.post(
      `${this.authPath}/refresh-token`,
      validationMiddleware(refreshTokenSchema, 'body'),
      this.authController.refreshToken
    );
    
    this.router.post(
      `${this.authPath}/logout`,
      userAuthMiddleware(),
      validationMiddleware(logoutSchema, 'body'),
      this.authController.logout
    );

  }
}

export default AuthRoute;
