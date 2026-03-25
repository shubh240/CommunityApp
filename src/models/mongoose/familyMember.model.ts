import mongoose, { Schema } from 'mongoose';
import { FamilyMemberAttributes, FamilyRelation } from './interfaces/familyMember.model.interface';

const familyMemberSchema = new Schema<FamilyMemberAttributes>(
  {
    headUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    relation: {
      type: String,
      enum: [
        'SELF', 'FATHER', 'MOTHER', 'SPOUSE',
        'BROTHER', 'SISTER', 'SON', 'DAUGHTER',
        'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNT',
        'COUSIN', 'OTHER',
      ] as FamilyRelation[],
      required: true,
    },

    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    dateOfBirth: { type: Date, required: false },
    profileImage: { type: String, default: '' },
    mobile: { type: String, default: '' },

    isRegistered: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

familyMemberSchema.index({ headUserId: 1, relation: 1 });

const FamilyMember = mongoose.model<FamilyMemberAttributes>(
  'FamilyMember',
  familyMemberSchema
);

export default FamilyMember;
