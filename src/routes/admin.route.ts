import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import { adminRegisterSchema, adminLoginSchema, adminRefreshTokenSchema, adminLogoutSchema, reviewUserDocSchema, userUnderReviewSchema, matrimonialProfileListSchema, reviewMatrimonialProfileSchema } from '@/validationSchema/admin.validation.schema';
import { AdminAuthController } from '@/controllers/admin.controller';
import AdminAuthRepo from '@/repository/admin.repository';
import { adminAuthMiddleware } from '@/middlewares/adminAuth.middleware';

class AdminAuthRoute implements Routes {
  public path = '/admin';
  public router = Router();
  public controller = new AdminAuthController(new AdminAuthRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(adminRegisterSchema, 'body'),
      this.controller.register
    );

    this.router.post(
      `${this.path}/login`,
      validationMiddleware(adminLoginSchema, 'body'),
      this.controller.login
    );

    this.router.post(
      `${this.path}/refresh-token`,
      validationMiddleware(adminRefreshTokenSchema, 'body'),
      this.controller.refreshToken
    );

    this.router.post(
      `${this.path}/logout`,
      adminAuthMiddleware(),
      validationMiddleware(adminLogoutSchema, 'body'),
      this.controller.logout
    );

    this.router.get(
      `${this.path}/kyc/submitted`,
      adminAuthMiddleware(),
      validationMiddleware(userUnderReviewSchema, 'query'),
      this.controller.listSubmittedKycUsers
    );

    this.router.post(
      `${this.path}/reviewUserDocument`,
      adminAuthMiddleware(),
      validationMiddleware(reviewUserDocSchema,'body'),
      this.controller.reviewUserDocument
    );

    // ─── Matrimonial Admin Routes ───────────────────
    this.router.get(
      `${this.path}/matrimonial/profiles`,
      adminAuthMiddleware(),
      validationMiddleware(matrimonialProfileListSchema, 'query'),
      this.controller.listMatrimonialProfiles
    );

    this.router.post(
      `${this.path}/matrimonial/review`,
      adminAuthMiddleware(),
      validationMiddleware(reviewMatrimonialProfileSchema, 'body'),
      this.controller.reviewMatrimonialProfile
    );
  }
}

export default AdminAuthRoute;
