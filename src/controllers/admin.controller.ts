import { Request, Response, NextFunction } from 'express';
import { generalResponse } from '@/helper/common.helper';
import AdminAuthRepo from '@/repository/admin.repository';
import AdminProfileRepo from '@/repository/adminProfile.repository';
import AdminUserRepo from '@/repository/adminUser.repository';
import AdminReportRepo from '@/repository/adminReport.repository';
import AdminModerationRepo from '@/repository/adminModeration.repository';
import AdminDashboardRepo from '@/repository/adminDashboard.repository';
import { ADMIN_MESSAGES } from '@/messages/admin.messages';

export class AdminAuthController {
  constructor(
    private readonly repo: AdminAuthRepo,
    private readonly profileRepo: AdminProfileRepo,
    private readonly userRepo: AdminUserRepo,
    private readonly reportRepo: AdminReportRepo,
    private readonly moderationRepo: AdminModerationRepo,
    private readonly dashboardRepo: AdminDashboardRepo,
  ) {}

  // ═══════════════════════════════════════════════════
  //  AUTH (existing)
  // ═══════════════════════════════════════════════════

  readonly register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.register(req);
      return generalResponse(res, data, ADMIN_MESSAGES.REGISTER_SUCCESS, 'success', false, 201);
    } catch (error) { next(error); }
  };

  readonly login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.login(req);
      return generalResponse(res, data, ADMIN_MESSAGES.LOGIN_SUCCESS, 'success');
    } catch (error) { next(error); }
  };

  readonly refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.refreshToken(req);
      return generalResponse(res, data, ADMIN_MESSAGES.ACCESS_REFRESHED, 'success');
    } catch (error) { next(error); }
  };

  readonly logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.adminTokenData.adminId;
      const { deviceId } = req.body;
      await this.repo.logout(adminId, deviceId);
      return generalResponse(res, null, ADMIN_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  KYC REVIEW (existing)
  // ═══════════════════════════════════════════════════

  readonly listSubmittedKycUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.listSubmittedKycUsers(req);
      return generalResponse(res, data, ADMIN_MESSAGES.LIST_SUBMITTED_KYC, 'success');
    } catch (error) { next(error); }
  };

  readonly reviewUserDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.reviewUserDocument(req);
      return generalResponse(res, data.doc, data.message, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  MATRIMONIAL REVIEW (existing)
  // ═══════════════════════════════════════════════════

  readonly listMatrimonialProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.listMatrimonialProfiles(req);
      return generalResponse(res, data, ADMIN_MESSAGES.MATRIMONIAL_PROFILES_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getMatrimonialProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.moderationRepo.getMatrimonialProfile(req);
      return generalResponse(res, data, ADMIN_MESSAGES.MATRIMONIAL_PROFILE_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly reviewMatrimonialProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.repo.reviewMatrimonialProfile(req);
      return generalResponse(res, data.profile, data.message, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  PROFILE
  // ═══════════════════════════════════════════════════

  readonly getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.profileRepo.getProfile(req);
      return generalResponse(res, data, ADMIN_MESSAGES.PROFILE_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.profileRepo.updateProfile(req);
      return generalResponse(res, data, ADMIN_MESSAGES.PROFILE_UPDATED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.profileRepo.changePassword(req);
      return generalResponse(res, data, ADMIN_MESSAGES.PASSWORD_CHANGED, 'success', true);
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  FORGOT PASSWORD (OTP)
  // ═══════════════════════════════════════════════════

  readonly forgotPasswordSendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.profileRepo.forgotPasswordSendOtp(req);
      return generalResponse(res, data, ADMIN_MESSAGES.OTP_SENT, 'success', true);
    } catch (error) { next(error); }
  };

  readonly forgotPasswordVerifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.profileRepo.forgotPasswordVerifyOtp(req);
      return generalResponse(res, data, ADMIN_MESSAGES.OTP_VERIFIED, 'success');
    } catch (error) { next(error); }
  };

  readonly forgotPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.profileRepo.forgotPasswordReset(req);
      return generalResponse(res, data, ADMIN_MESSAGES.PASSWORD_RESET, 'success', true);
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  USER MANAGEMENT
  // ═══════════════════════════════════════════════════

  readonly listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepo.listUsers(req);
      return generalResponse(res, data, ADMIN_MESSAGES.USERS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepo.getUser(req);
      return generalResponse(res, data, ADMIN_MESSAGES.USER_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepo.blockUser(req);
      return generalResponse(res, data, ADMIN_MESSAGES.USER_BLOCKED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepo.unblockUser(req);
      return generalResponse(res, data, ADMIN_MESSAGES.USER_UNBLOCKED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepo.deleteUser(req);
      return generalResponse(res, data, ADMIN_MESSAGES.USER_DELETED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly getUserStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userRepo.getUserStats(req);
      return generalResponse(res, data, ADMIN_MESSAGES.USER_STATS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  REPORTS
  // ═══════════════════════════════════════════════════

  readonly listReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportRepo.listReports(req);
      return generalResponse(res, data, ADMIN_MESSAGES.REPORTS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportRepo.getReport(req);
      return generalResponse(res, data, ADMIN_MESSAGES.REPORT_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly takeReportAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportRepo.takeAction(req);
      return generalResponse(res, data, ADMIN_MESSAGES.REPORT_ACTION_TAKEN, 'success', true);
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  MODERATION: POSTS, STORIES, GROUPS
  // ═══════════════════════════════════════════════════

  readonly listPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.moderationRepo.listPosts(req);
      return generalResponse(res, data, ADMIN_MESSAGES.POSTS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.moderationRepo.deletePost(req);
      return generalResponse(res, data, ADMIN_MESSAGES.POST_DELETED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly listStories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.moderationRepo.listStories(req);
      return generalResponse(res, data, ADMIN_MESSAGES.STORIES_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly deleteStory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.moderationRepo.deleteStory(req);
      return generalResponse(res, data, ADMIN_MESSAGES.STORY_DELETED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly listGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.moderationRepo.listGroups(req);
      return generalResponse(res, data, ADMIN_MESSAGES.GROUPS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.moderationRepo.getGroup(req);
      return generalResponse(res, data, ADMIN_MESSAGES.GROUP_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.moderationRepo.deleteGroup(req);
      return generalResponse(res, data, ADMIN_MESSAGES.GROUP_DELETED, 'success', true);
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════════════════

  readonly getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.dashboardRepo.getDashboardStats(req);
      return generalResponse(res, data, ADMIN_MESSAGES.DASHBOARD_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getGrowth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.dashboardRepo.getGrowth(req);
      return generalResponse(res, data, ADMIN_MESSAGES.GROWTH_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  BROADCAST
  // ═══════════════════════════════════════════════════

  readonly broadcastNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.dashboardRepo.broadcast(req);
      return generalResponse(res, data, ADMIN_MESSAGES.BROADCAST_SENT, 'success', true);
    } catch (error) { next(error); }
  };
}
