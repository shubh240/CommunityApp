import mongoose, { Schema } from 'mongoose';
import {
  MatrimonialProfileAttributes,
  MatrimonialMaritalStatus,
} from './interfaces/matrimonialProfile.model.interface';

const partnerPreferencesSchema = new Schema(
  {
    ageMin: { type: Number, default: 18 },
    ageMax: { type: Number, default: 40 },
    heightMin: { type: Number, default: 0 },
    heightMax: { type: Number, default: 300 },
    locationPreference: { type: String, default: '' },
    educationPreference: { type: String, default: '' },
    maritalStatus: [
      {
        type: String,
        enum: ['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'] as MatrimonialMaritalStatus[],
      },
    ],
  },
  { _id: false }
);

const matrimonialProfileSchema = new Schema<MatrimonialProfileAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    createdForUserId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      index: true,
    },

    // Basic Details
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    height: { type: Number, required: false },
    maritalStatus: {
      type: String,
      enum: ['NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE'] as MatrimonialMaritalStatus[],
      required: false,
    },

    // Community Details
    subCaste: { type: String, default: '' },
    gotra: { type: String, default: '' },
    nativePlace: { type: String, default: '' },
    currentCity: { type: String, default: '' },

    // Family Summary
    fatherName: { type: String, default: '' },
    motherName: { type: String, default: '' },
    familyType: {
      type: String,
      enum: ['NUCLEAR', 'JOINT', 'EXTENDED'],
      default: 'NUCLEAR',
    },

    // Education & Profession
    education: { type: String, default: '' },
    profession: { type: String, default: '' },
    company: { type: String, default: '' },
    annualIncome: { type: String, default: '' },

    // Photos & About
    photos: [{ type: String }],
    aboutCandidate: { type: String, default: '' },

    // Partner Preferences
    partnerPreferences: {
      type: partnerPreferencesSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'DRAFT',
      index: true,
    },

    rejectionReason: { type: String, required: false },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
    },

    reviewedAt: { type: Date, required: false },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

matrimonialProfileSchema.index({ userId: 1, status: 1 });
matrimonialProfileSchema.index({ status: 1, createdAt: -1 });

const MatrimonialProfile = mongoose.model<MatrimonialProfileAttributes>(
  'MatrimonialProfile',
  matrimonialProfileSchema
);

export default MatrimonialProfile;
