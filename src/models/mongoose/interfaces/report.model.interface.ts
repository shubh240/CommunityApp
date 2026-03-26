import { Document, Types } from 'mongoose';

export type ReportType = 'POST' | 'USER' | 'COMMENT';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED';

export interface ReportAttributes extends Document {
  reporterId: Types.ObjectId;
  reportedId: Types.ObjectId;
  type: ReportType;
  referenceId?: Types.ObjectId;
  reason: string;
  description?: string;
  status: ReportStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
}
