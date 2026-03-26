import mongoose, { Schema } from 'mongoose';
import { ReportAttributes } from './interfaces/report.model.interface';

const reportSchema = new Schema<ReportAttributes>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    reportedId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['POST', 'USER', 'COMMENT'],
      required: true,
      index: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    reason: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
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

reportSchema.index({ reporterId: 1, type: 1, referenceId: 1 });

const Report = mongoose.model<ReportAttributes>('Report', reportSchema);

export default Report;
