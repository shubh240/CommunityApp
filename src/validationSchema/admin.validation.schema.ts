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
