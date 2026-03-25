import mongoose, { Schema, Types } from 'mongoose';
import { UserDocAttributes } from './interfaces/userDoc.model.interface';

const userDocSchema = new Schema<UserDocAttributes>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      // enum: [
      //   'ADDRESS_PROOF',
      //   'EDUCATION_PROOF',
      //   'IDENTITY_PROOF',
      //   'OTHER',
      // ],
      required: true,
      index: true,
    },
    // step: {
    //   type: Number,
    //   /*
    //     2 = Address Proof
    //     3 = Identity Proof
    //     4 = Education Proof
    //     5 = Other Docs
    //   */
    // },

    documentName: {
      type: String,
      required: true,
    },

    frontImage: {
      type: String,
      required: true,
    },

    backImage: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rejectionReason: {
      type: String,
      required: false,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
      index: true,
    },

    reviewedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

userDocSchema.index({ userId: 1, type: 1 });
userDocSchema.index({ status: 1, createdAt: -1 });

const UserDoc = mongoose.model<UserDocAttributes>(
  'UserDoc',
  userDocSchema
);

export default UserDoc;
