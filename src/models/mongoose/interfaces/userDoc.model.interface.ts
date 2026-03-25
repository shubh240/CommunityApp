import { Document, Types } from 'mongoose';

export type UserDocType =
  | 'ADDRESS_PROOF'
  | 'IDENTITY_PROOF'
  | 'EDUCATION_PROOF'
  | 'OTHER';

export type UserDocStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface UserDocAttributes extends Document {
  userId: Types.ObjectId;

  type: string;

  // 🔹 onboarding step this doc belongs to
  step?: number;

  documentName: string;

  frontImage: string;
  backImage?: string;

  status: UserDocStatus;

  rejectionReason?: string;

  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;

  isActive: boolean;
}
