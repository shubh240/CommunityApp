import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  adminRegisterSchema,
  adminLoginSchema,
  adminRefreshTokenSchema,
  adminLogoutSchema,
  reviewUserDocSchema,
  userUnderReviewSchema,
  matrimonialProfileListSchema,
  reviewMatrimonialProfileSchema,
  updateAdminProfileSchema,
  changePasswordSchema,
  forgotPasswordSendOtpSchema,
  forgotPasswordVerifyOtpSchema,
  forgotPasswordResetSchema,
  listUsersSchema,
  userIdParamSchema,
  listReportsSchema,
  reportIdParamSchema,
  reportActionSchema,
  listPostsSchema,
  postIdParamSchema,
  storyIdParamSchema,
  listStoriesSchema,
  listGroupsSchema,
  groupIdParamSchema,
  matrimonialProfileIdParamSchema,
  growthQuerySchema,
  broadcastNotificationSchema,
} from '@/validationSchema/admin.validation.schema';
import { AdminAuthController } from '@/controllers/admin.controller';
import AdminAuthRepo from '@/repository/admin.repository';
import AdminProfileRepo from '@/repository/adminProfile.repository';
import AdminUserRepo from '@/repository/adminUser.repository';
import AdminReportRepo from '@/repository/adminReport.repository';
import AdminModerationRepo from '@/repository/adminModeration.repository';
import AdminDashboardRepo from '@/repository/adminDashboard.repository';
import { adminAuthMiddleware } from '@/middlewares/adminAuth.middleware';

class AdminAuthRoute implements Routes {
  public path = '/admin';
  public router = Router();
  public controller = new AdminAuthController(
    new AdminAuthRepo(),
    new AdminProfileRepo(),
    new AdminUserRepo(),
    new AdminReportRepo(),
    new AdminModerationRepo(),
    new AdminDashboardRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const auth = adminAuthMiddleware();

    // ─── Auth (existing) ────────────────────────────
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
      auth,
      validationMiddleware(adminLogoutSchema, 'body'),
      this.controller.logout
    );

    // ─── Forgot Password (no auth) ──────────────────
    this.router.post(
      `${this.path}/forgot-password/send-otp`,
      validationMiddleware(forgotPasswordSendOtpSchema, 'body'),
      this.controller.forgotPasswordSendOtp
    );

    this.router.post(
      `${this.path}/forgot-password/verify-otp`,
      validationMiddleware(forgotPasswordVerifyOtpSchema, 'body'),
      this.controller.forgotPasswordVerifyOtp
    );

    this.router.post(
      `${this.path}/forgot-password/reset`,
      validationMiddleware(forgotPasswordResetSchema, 'body'),
      this.controller.forgotPasswordReset
    );

    // ─── Admin Profile ──────────────────────────────
    this.router.get(
      `${this.path}/profile`,
      auth,
      this.controller.getProfile
    );

    this.router.put(
      `${this.path}/profile`,
      auth,
      validationMiddleware(updateAdminProfileSchema, 'body'),
      this.controller.updateProfile
    );

    this.router.post(
      `${this.path}/change-password`,
      auth,
      validationMiddleware(changePasswordSchema, 'body'),
      this.controller.changePassword
    );

    // ─── KYC Review ─────────────────────────────────
    this.router.get(
      `${this.path}/kyc/submitted`,
      auth,
      validationMiddleware(userUnderReviewSchema, 'query'),
      this.controller.listSubmittedKycUsers
    );

    this.router.post(
      `${this.path}/reviewUserDocument`,
      auth,
      validationMiddleware(reviewUserDocSchema, 'body'),
      this.controller.reviewUserDocument
    );

    // ─── Matrimonial Review ─────────────────────────
    this.router.get(
      `${this.path}/matrimonial/profiles`,
      auth,
      validationMiddleware(matrimonialProfileListSchema, 'query'),
      this.controller.listMatrimonialProfiles
    );

    this.router.get(
      `${this.path}/matrimonial/profiles/:profileId`,
      auth,
      validationMiddleware(matrimonialProfileIdParamSchema, 'params'),
      this.controller.getMatrimonialProfile
    );

    this.router.post(
      `${this.path}/matrimonial/review`,
      auth,
      validationMiddleware(reviewMatrimonialProfileSchema, 'body'),
      this.controller.reviewMatrimonialProfile
    );

    // ─── User Management ────────────────────────────
    this.router.get(
      `${this.path}/users`,
      auth,
      validationMiddleware(listUsersSchema, 'query'),
      this.controller.listUsers
    );

    this.router.get(
      `${this.path}/users/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.getUser
    );

    this.router.get(
      `${this.path}/users/:userId/stats`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.getUserStats
    );

    this.router.post(
      `${this.path}/users/:userId/block`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.blockUser
    );

    this.router.post(
      `${this.path}/users/:userId/unblock`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.unblockUser
    );

    this.router.delete(
      `${this.path}/users/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.deleteUser
    );

    // ─── Reports Moderation ─────────────────────────
    this.router.get(
      `${this.path}/reports`,
      auth,
      validationMiddleware(listReportsSchema, 'query'),
      this.controller.listReports
    );

    this.router.get(
      `${this.path}/reports/:reportId`,
      auth,
      validationMiddleware(reportIdParamSchema, 'params'),
      this.controller.getReport
    );

    this.router.post(
      `${this.path}/reports/:reportId/action`,
      auth,
      validationMiddleware(reportIdParamSchema, 'params'),
      validationMiddleware(reportActionSchema, 'body'),
      this.controller.takeReportAction
    );

    // ─── Posts Moderation ───────────────────────────
    this.router.get(
      `${this.path}/posts`,
      auth,
      validationMiddleware(listPostsSchema, 'query'),
      this.controller.listPosts
    );

    this.router.delete(
      `${this.path}/posts/:postId`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      this.controller.deletePost
    );

    // ─── Stories Moderation ─────────────────────────
    this.router.get(
      `${this.path}/stories`,
      auth,
      validationMiddleware(listStoriesSchema, 'query'),
      this.controller.listStories
    );

    this.router.delete(
      `${this.path}/stories/:storyId`,
      auth,
      validationMiddleware(storyIdParamSchema, 'params'),
      this.controller.deleteStory
    );

    // ─── Groups Moderation ──────────────────────────
    this.router.get(
      `${this.path}/groups`,
      auth,
      validationMiddleware(listGroupsSchema, 'query'),
      this.controller.listGroups
    );

    this.router.get(
      `${this.path}/groups/:groupId`,
      auth,
      validationMiddleware(groupIdParamSchema, 'params'),
      this.controller.getGroup
    );

    this.router.delete(
      `${this.path}/groups/:groupId`,
      auth,
      validationMiddleware(groupIdParamSchema, 'params'),
      this.controller.deleteGroup
    );

    // ─── Dashboard ──────────────────────────────────
    this.router.get(
      `${this.path}/dashboard/stats`,
      auth,
      this.controller.getDashboardStats
    );

    this.router.get(
      `${this.path}/dashboard/growth`,
      auth,
      validationMiddleware(growthQuerySchema, 'query'),
      this.controller.getGrowth
    );

    // ─── Broadcast ──────────────────────────────────
    this.router.post(
      `${this.path}/broadcast/notification`,
      auth,
      validationMiddleware(broadcastNotificationSchema, 'body'),
      this.controller.broadcastNotification
    );
  }
}

export default AdminAuthRoute;
