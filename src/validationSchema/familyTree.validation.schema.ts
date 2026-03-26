import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

const relationValues = [
  'SELF', 'FATHER', 'MOTHER', 'SPOUSE',
  'BROTHER', 'SISTER', 'SON', 'DAUGHTER',
  'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNT',
  'COUSIN', 'OTHER',
];

export const addMemberSchema = Joi.object({
  relation: Joi.string().valid(...relationValues).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().allow('').default(''),
  dateOfBirth: Joi.date().iso().optional(),
  profileImage: Joi.string().allow('').default(''),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).allow('').default(''),
});

export const updateMemberSchema = Joi.object({
  relation: Joi.string().valid(...relationValues).optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().allow('').optional(),
  dateOfBirth: Joi.date().iso().allow(null).optional(),
  profileImage: Joi.string().allow('').optional(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).allow('').optional(),
});

export const memberIdParamSchema = Joi.object({
  memberId: objectId.required(),
});

export const linkMemberSchema = Joi.object({
  userId: objectId.required(),
});

export const familyPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(50),
  relation: Joi.string().valid(...relationValues).optional(),
});
