import Joi from 'joi';
import { joiCommon } from './common.validation';

export const completeProfileSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  language: Joi.string().valid('en', 'hi').optional(),
});

export const addressProofSchema = Joi.object({
  type: Joi.string()
    .valid('ADDRESS_PROOF', 'EDUCATION_PROOF', 'OTHER')
    .required(),
  documentName : Joi.string().required(),
  frontImage: Joi.string().required(),
  backImage: Joi.string().optional(),
});

export const reuploadDocumentSchema = Joi.object({
  docId: Joi.string().required(),
  documentName: Joi.string().optional(),
  frontImage: Joi.string().required(),
  backImage: Joi.string().optional(),
});

export const educationProofSchema = Joi.object({
  documentName: Joi.string().required(),
  frontImage: Joi.string().uri().required(),
  backImage: Joi.string().uri().optional(),
});

export const setFcmSchema = Joi.object({
  fcmToken: joiCommon.joiString.label('Fcm').required(),
}).options({
  abortEarly: false,
});

export const userWebHelpRequestSchema = Joi.object({
  firstName: joiCommon.joiString.label('First Name').required(),
  lastName: joiCommon.joiString.label('Last Name').required(),
  mobile: joiCommon.joiString
    .length(10)
    .pattern(/^[0-9]+$/)
    .label('Mobile')
    .required(),
  location: joiCommon.joiString.label('Location').required(),
  pincode: joiCommon.joiString.label('Pincode').required(),
  state: joiCommon.joiString.label('State').required(),
  district: joiCommon.joiString.label('District').required(),
  block: joiCommon.joiString.label('Block').required(),
  helpCategory: joiCommon.joiString.label('Help Category').required(),
  helpSubCategory: joiCommon.joiString.label('Help Sub Category').required(),
  helpMode: joiCommon.joiString.label('Help Mode').required(),
  description: joiCommon.joiString.label('description').required(),
}).options({
  abortEarly: false,
});

export const getWebHelpList = Joi.object({
  contact: joiCommon.joiNumber.label('Mobile').required(),
}).options({
  abortEarly: false,
});
