import Joi from 'joi';
import { joiCommon } from './common.validation';

export const sendOtpSchema = Joi.object({
  mobile: Joi.number()
    .integer()
    .min(1000000000)
    .max(9999999999)
    .required()
});

export const verifyOtpSchema = Joi.object({
  mobile: Joi.number()
    .integer()
    .min(1000000000)
    .max(9999999999)
    .required()
    .messages({
      'number.base': 'Mobile number must be a number',
      'number.min': 'Mobile number must be 10 digits',
      'number.max': 'Mobile number must be 10 digits',
      'any.required': 'Mobile number is required',
    }),
  otp: Joi.number()
    .integer()
    .min(100000)
    .max(999999)
    .required()
    .messages({
      'number.base': 'OTP must be a number',
      'number.min': 'OTP must be 6 digits',
      'number.max': 'OTP must be 6 digits',
      'any.required': 'OTP is required',
    }),
  deviceInfo: Joi.object({
    deviceId: Joi.string().required(),
    platform: Joi.string().valid('android', 'ios', 'web').required(),
    appVersion: Joi.string().optional(),
  }).required()
});


export const adminLoginSchema = Joi.object({
  mobile: joiCommon.joiString
    .length(10)
    .pattern(/^[0-9]+$/)
    .label('Mobile')
    .required(),
  password: Joi.string().label('Password').required(),
}).options({
  abortEarly: false,
});

export const registerUserSchema = Joi.object({
  firstName: joiCommon.joiString.label('First Name').required(),
  lastName: joiCommon.joiString.label('Last Name').required(),
  mobile: joiCommon.joiString
    .length(10)
    .pattern(/^[0-9]+$/)
    .label('Mobile')
    .required(),
  email: joiCommon.joiEmail.label('Email').required(),
  address: joiCommon.joiString.label('Address').required(),
  pincode: joiCommon.joiString.label('Pincode').required(),
  state: joiCommon.joiString.label('State').required(),
  district: joiCommon.joiString.label('District').required(),
  block: joiCommon.joiString.label('Block').required(),
}).options({
  abortEarly: false,
});

export const initUserSchema = Joi.object({
  mobile: joiCommon.joiString
    .length(10)
    .pattern(/^[0-9]+$/)
    .label('Mobile')
    .required(),
}).options({
  abortEarly: false,
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
  deviceId: Joi.string().required(),
});

export const logoutSchema = Joi.object({
  deviceId: Joi.string().required(),
})