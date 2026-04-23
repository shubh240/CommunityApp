// admin.validation.schema.ts
import Joi from 'joi';

export const adminRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  mobile: Joi.number().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const adminRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
  deviceId: Joi.string().required(),
});

export const adminLogoutSchema = Joi.object({
  deviceId: Joi.string().required(),
});

export const adminLoginSchema = Joi.object({
  mobile: Joi.number().required(),
  password: Joi.string().min(6).required(),
  deviceInfo: Joi.object({
    deviceId: Joi.string().required(),
    platform: Joi.string().valid('web', 'android', 'ios').required(),
    appVersion: Joi.string().optional(),
  }).optional(),
});

export const userUnderReviewSchema = Joi.object({
  kycStatus : Joi.string().optional(),
  page:Joi.number().optional(),
  pageSize:Joi.number().optional()
});

export const reviewUserDocSchema = Joi.object({
  userId: Joi.string().required(),
  docId: Joi.string().required(),
  action: Joi.string()
    .valid("APPROVED", "REJECTED")
    .required(),

  rejectionReason: Joi.when("action", {
    is: "REJECTED",
    then: Joi.string().min(1).required(),
    otherwise: Joi.forbidden()
  })
});

export const matrimonialProfileListSchema = Joi.object({
  status: Joi.string().valid('UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT').optional(),
  page: Joi.number().optional(),
  pageSize: Joi.number().optional(),
});

export const reviewMatrimonialProfileSchema = Joi.object({
  profileId: Joi.string().required(),
  action: Joi.string().valid('APPROVED', 'REJECTED').required(),
  rejectionReason: Joi.when('action', {
    is: 'REJECTED',
    then: Joi.string().min(1).required(),
    otherwise: Joi.forbidden(),
  }),
});

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

// ─── Admin Profile ────────────────────────────────────
export const updateAdminProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  profileImage: Joi.string().allow('').optional(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

// ─── Forgot Password (OTP) ────────────────────────────
export const forgotPasswordSendOtpSchema = Joi.object({
  mobile: Joi.number().required(),
});

export const forgotPasswordVerifyOtpSchema = Joi.object({
  mobile: Joi.number().required(),
  otp: Joi.number().required(),
});

export const forgotPasswordResetSchema = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// ─── User Management ──────────────────────────────────
export const listUsersSchema = Joi.object({
  status: Joi.string().valid('NEW', 'PENDING', 'APPROVED', 'REJECTED').optional(),
  kycStatus: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED').optional(),
  isBlocked: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  q: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

export const userIdParamSchema = Joi.object({
  userId: objectId.required(),
});

export const blockUserSchema = Joi.object({
  reason: Joi.string().allow('').optional(),
});

// ─── Reports ──────────────────────────────────────────
export const listReportsSchema = Joi.object({
  type: Joi.string().valid('POST', 'USER', 'COMMENT').optional(),
  status: Joi.string().valid('PENDING', 'REVIEWED', 'DISMISSED').optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

export const reportIdParamSchema = Joi.object({
  reportId: objectId.required(),
});

export const reportActionSchema = Joi.object({
  action: Joi.string().valid('DISMISS', 'DELETE_CONTENT', 'WARN_USER', 'BAN_USER').required(),
  note: Joi.string().allow('').optional(),
});

// ─── Moderation ───────────────────────────────────────
export const listPostsSchema = Joi.object({
  postType: Joi.string().valid('TEXT', 'IMAGE', 'VIDEO').optional(),
  visibility: Joi.string().valid('PUBLIC', 'FRIENDS', 'PRIVATE').optional(),
  userId: objectId.optional(),
  q: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

export const postIdParamSchema = Joi.object({
  postId: objectId.required(),
});

export const storyIdParamSchema = Joi.object({
  storyId: objectId.required(),
});

export const listStoriesSchema = Joi.object({
  userId: objectId.optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

export const listGroupsSchema = Joi.object({
  groupType: Joi.string().valid('PUBLIC', 'PRIVATE', 'PASSWORD').optional(),
  q: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});

export const groupIdParamSchema = Joi.object({
  groupId: objectId.required(),
});

export const matrimonialProfileIdParamSchema = Joi.object({
  profileId: objectId.required(),
});

// ─── Dashboard ────────────────────────────────────────
export const growthQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(30),
});

// ─── Broadcast ────────────────────────────────────────
export const broadcastNotificationSchema = Joi.object({
  title: Joi.string().required(),
  message: Joi.string().required(),
  targetType: Joi.string().valid('ALL', 'KYC_STATUS', 'CITY', 'USER_IDS').default('ALL'),
  kycStatus: Joi.when('targetType', {
    is: 'KYC_STATUS',
    then: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED').required(),
    otherwise: Joi.forbidden(),
  }),
  city: Joi.when('targetType', {
    is: 'CITY',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  userIds: Joi.when('targetType', {
    is: 'USER_IDS',
    then: Joi.array().items(objectId).min(1).required(),
    otherwise: Joi.forbidden(),
  }),
});
