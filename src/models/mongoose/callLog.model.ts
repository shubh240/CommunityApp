import mongoose, { Schema } from 'mongoose';
import { CallLogAttributes, CallType, CallStatus } from './interfaces/callLog.model.interface';

const callLogSchema = new Schema<CallLogAttributes>(
  {
    callerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true,
    },

    callType: {
      type: String,
      enum: ['VOICE', 'VIDEO'] as CallType[],
      required: true,
    },

    status: {
      type: String,
      enum: ['OUTGOING', 'INCOMING', 'MISSED', 'REJECTED'] as CallStatus[],
      required: true,
      index: true,
    },

    duration: { type: Number, default: 0 },
    startedAt: { type: Date, required: false },
    endedAt: { type: Date, required: false },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    recordingUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

callLogSchema.index({ callerId: 1, createdAt: -1 });
callLogSchema.index({ receiverId: 1, createdAt: -1 });
callLogSchema.index({ chatRoomId: 1, createdAt: -1 });

const CallLog = mongoose.model<CallLogAttributes>('CallLog', callLogSchema);

export default CallLog;
