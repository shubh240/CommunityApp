import { Document, Types } from 'mongoose';

export type MatrimonialProfileStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type MatrimonialFamilyType = 'NUCLEAR' | 'JOINT' | 'EXTENDED';
export type MatrimonialMaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE';

export interface MatrimonialProfileAttributes extends Document {
  userId: Types.ObjectId;           // registered user who owns this profile
  createdForUserId: Types.ObjectId; // family member this profile is for (from FamilyMember)

  // Basic Details
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  height: number;                   // in cm
  maritalStatus: MatrimonialMaritalStatus;

  // Community Details
  subCaste: string;
  gotra: string;
  nativePlace: string;
  currentCity: string;

  // Family Summary
  fatherName: string;
  motherName: string;
  familyType: MatrimonialFamilyType;

  // Education & Profession
  education: string;
  profession: string;
  company: string;
  annualIncome: string;

  // Photos & About
  photos: string[];
  aboutCandidate: string;

  // Partner Preferences
  partnerPreferences: {
    ageMin: number;
    ageMax: number;
    heightMin: number;
    heightMax: number;
    locationPreference: string;
    educationPreference: string;
    maritalStatus: MatrimonialMaritalStatus[];
  };

  status: MatrimonialProfileStatus;
  rejectionReason: string;
  reviewedBy: Types.ObjectId;
  reviewedAt: Date;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
