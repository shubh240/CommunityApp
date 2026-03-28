import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

const maritalStatusValues = ['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'];
const familyTypeValues = ['NUCLEAR', 'JOINT', 'EXTENDED'];

// ─── Profile: Create (Step 1 - Basic Details) ────────
export const createProfileSchema = Joi.object({
  createdForUserId: objectId.required(), // family member ID
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dateOfBirth: Joi.date().iso().required(),
  height: Joi.number().optional(),
  maritalStatus: Joi.string().valid(...maritalStatusValues).optional(),
});

// ─── Profile: Update Community Details (Step 2) ──────
export const updateCommunityDetailsSchema = Joi.object({
  subCaste: Joi.string().allow('').optional(),
  gotra: Joi.string().allow('').optional(),
  nativePlace: Joi.string().allow('').optional(),
  currentCity: Joi.string().allow('').optional(),
});

// ─── Profile: Update Family Summary (Step 3) ─────────
export const updateFamilySummarySchema = Joi.object({
  fatherName: Joi.string().allow('').optional(),
  motherName: Joi.string().allow('').optional(),
  familyType: Joi.string().valid(...familyTypeValues).optional(),
});

// ─── Profile: Update Education & Profession (Step 4) ─
export const updateEducationSchema = Joi.object({
  education: Joi.string().allow('').optional(),
  profession: Joi.string().allow('').optional(),
  company: Joi.string().allow('').optional(),
  annualIncome: Joi.string().allow('').optional(),
});

// ─── Profile: Update Photos & About (Step 5) ─────────
export const updatePhotosSchema = Joi.object({
  photos: Joi.array().items(Joi.string()).optional(),
  aboutCandidate: Joi.string().allow('').optional(),
});

// ─── Profile: Update Partner Preferences (Step 6) ────
export const updatePartnerPreferencesSchema = Joi.object({
  partnerPreferences: Joi.object({
    ageMin: Joi.number().min(18).default(18),
    ageMax: Joi.number().min(18).default(40),
    heightMin: Joi.number().default(0),
    heightMax: Joi.number().default(300),
    locationPreference: Joi.string().allow('').default(''),
    educationPreference: Joi.string().allow('').default(''),
    maritalStatus: Joi.array().items(Joi.string().valid(...maritalStatusValues)).default([]),
  }).required(),
});

// ─── Profile: Full Update (all fields) ───────────────
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  dateOfBirth: Joi.date().iso().optional(),
  height: Joi.number().optional(),
  maritalStatus: Joi.string().valid(...maritalStatusValues).optional(),
  subCaste: Joi.string().allow('').optional(),
  gotra: Joi.string().allow('').optional(),
  nativePlace: Joi.string().allow('').optional(),
  currentCity: Joi.string().allow('').optional(),
  fatherName: Joi.string().allow('').optional(),
  motherName: Joi.string().allow('').optional(),
  familyType: Joi.string().valid(...familyTypeValues).optional(),
  education: Joi.string().allow('').optional(),
  profession: Joi.string().allow('').optional(),
  company: Joi.string().allow('').optional(),
  annualIncome: Joi.string().allow('').optional(),
  photos: Joi.array().items(Joi.string()).optional(),
  aboutCandidate: Joi.string().allow('').optional(),
  partnerPreferences: Joi.object({
    ageMin: Joi.number().min(18).optional(),
    ageMax: Joi.number().min(18).optional(),
    heightMin: Joi.number().optional(),
    heightMax: Joi.number().optional(),
    locationPreference: Joi.string().allow('').optional(),
    educationPreference: Joi.string().allow('').optional(),
    maritalStatus: Joi.array().items(Joi.string().valid(...maritalStatusValues)).optional(),
  }).optional(),
});

// ─── Params ──────────────────────────────────────────
export const profileIdParamSchema = Joi.object({
  profileId: objectId.required(),
});

export const interestIdParamSchema = Joi.object({
  interestId: objectId.required(),
});

// ─── Interest ────────────────────────────────────────
export const sendInterestSchema = Joi.object({
  fromProfileId: objectId.required(),
  toProfileId: objectId.required(),
  message: Joi.string().allow('').default(''),
});

export const respondInterestSchema = Joi.object({
  action: Joi.string().valid('ACCEPTED', 'REJECTED').required(),
});

// ─── Search / Browse ─────────────────────────────────
export const browseProfilesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
  // Filters
  ageMin: Joi.number().min(18).optional(),
  ageMax: Joi.number().min(18).optional(),
  heightMin: Joi.number().optional(),
  heightMax: Joi.number().optional(),
  maritalStatus: Joi.string().valid(...maritalStatusValues).optional(),
  education: Joi.string().optional(),
  city: Joi.string().optional(),
  q: Joi.string().allow('').optional(), // search by name
});

export const matrimonialPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
});
