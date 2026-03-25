import { Document, Types } from 'mongoose';

export type CallType = 'VOICE' | 'VIDEO';
export type CallStatus = 'OUTGOING' | 'INCOMING' | 'MISSED' | 'REJECTED';

export interface CallLogAttributes extends Document {
  callerId: Types.ObjectId;             // user who initiated the call
  receiverId: Types.ObjectId;           // user or group being called
  chatRoomId: Types.ObjectId;           // associated chat room

  callType: CallType;
  status: CallStatus;

  duration: number;                     // call duration in seconds
  startedAt: Date;
  endedAt: Date;

  participants: Types.ObjectId[];       // all users in the call
  recordingUrl: string;                 // recording file URL if recorded

  createdAt: Date;
  updatedAt: Date;
}
