import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  addressProofSchema,
  completeProfileSchema,
} from '@/validationSchema/user.validation.schema';
import { UserController } from '@/controllers/user.controller';
import UserRepo from '@/repository/user.repository';
import { userAuthMiddleware } from '@/middlewares/userAuth.middleware';
import type { NextFunction, Request, Response } from 'express';

class UserRoute implements Routes {
  public userPath = '/user/auth';
  public router = Router();
  public userController = new UserController(new UserRepo());

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.userPath}/completeProfile`,
      userAuthMiddleware(),
      validationMiddleware(completeProfileSchema, 'body'),
      this.userController.completeProfile,
    );
    this.router.post(
      `${this.userPath}/upload-documents`,
      userAuthMiddleware(),
      validationMiddleware(addressProofSchema, 'body'),
      this.userController.uploadUserDocument,
    );
    this.router.post(
      `${this.userPath}/reUpload-documents`,
      userAuthMiddleware(),
      validationMiddleware(addressProofSchema, 'body'),
      this.userController.uploadUserDocument,
    );
  }
}

export default UserRoute;
