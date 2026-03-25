import { Document, Types } from 'mongoose';

export type FamilyRelation =
  | 'SELF'
  | 'FATHER'
  | 'MOTHER'
  | 'SPOUSE'
  | 'BROTHER'
  | 'SISTER'
  | 'SON'
  | 'DAUGHTER'
  | 'GRANDFATHER'
  | 'GRANDMOTHER'
  | 'UNCLE'
  | 'AUNT'
  | 'COUSIN'
  | 'OTHER';

export interface FamilyMemberAttributes extends Document {
  headUserId: Types.ObjectId;   // registered user who is the head of this family
  userId: Types.ObjectId;       // if this member is also a registered user
  relation: FamilyRelation;

  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  profileImage: string;
  mobile: string;

  isRegistered: boolean;        // true if userId is a registered app user

  createdAt: Date;
  updatedAt: Date;
}
