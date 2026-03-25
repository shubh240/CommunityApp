import { Document, Types } from 'mongoose';

export type UserStatus = 'NEW' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type KycStatus ='NOT_STARTED'|'IN_PROGRESS' |'UNDER_REVIEW' |'APPROVED' |'REJECTED'

export interface UserAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface UserAttributes extends Document {
  _id: Types.ObjectId
  firstName?: string;
  lastName?: string;

  mobile: string;
  email?: string;

  profileImage?: string;

  // 🔹 ONBOARDING FLOW
  onboardingStep: number;

  // 🔹 OVERALL KYC STATE
  kycStatus: KycStatus;

  status: UserStatus;

  language: string;

  address?: UserAddress;

  isBlocked: boolean;

  lastLoginAt?: Date;

  isActive: boolean;
}

export interface AuthUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  isActive: boolean;
  block: boolean;
}
