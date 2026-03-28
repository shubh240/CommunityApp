import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { MESSAGING_MESSAGES } from '@/messages/messaging.messages';
import CallLog from '@/models/mongoose/callLog.model';
import ChatRoom from '@/models/mongoose/chatRoom.model';

export default class CallLogRepo {
  constructor() {}

  // ─── Create Call Log ───────────────────────────────
  readonly createCall = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { receiverId, chatRoomId, callType } = req.body;

    const room = await ChatRoom.findOne({ _id: chatRoomId, isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.participants.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.ROOM_UNAUTHORIZED);
    }

    const callLog = await CallLog.create({
      callerId: userId,
      receiverId: receiverId || null,
      chatRoomId,
      callType,
      status: 'OUTGOING',
      participants: room.type === 'GROUP' ? room.participants : [userId, receiverId],
    });

    return callLog;
  };

  // ─── Update Call Log ───────────────────────────────
  readonly updateCall = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { callId } = req.params;
    const { status, duration, startedAt, endedAt, recordingUrl } = req.body;

    const callLog = await CallLog.findById(callId);
    if (!callLog) throw new HttpException(404, MESSAGING_MESSAGES.CALL_NOT_FOUND);

    // Only caller or receiver can update
    const isParticipant = callLog.callerId.toString() === userId.toString()
      || (callLog.receiverId && callLog.receiverId.toString() === userId.toString())
      || callLog.participants.some(id => id.toString() === userId.toString());

    if (!isParticipant) throw new HttpException(403, 'Not authorized');

    if (status !== undefined) callLog.status = status;
    if (duration !== undefined) callLog.duration = duration;
    if (startedAt !== undefined) callLog.startedAt = startedAt;
    if (endedAt !== undefined) callLog.endedAt = endedAt;
    if (recordingUrl !== undefined) callLog.recordingUrl = recordingUrl;

    await callLog.save();
    return callLog;
  };

  // ─── Get Call Logs ─────────────────────────────────
  readonly getCallLogs = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const filter = {
      $or: [
        { callerId: userId },
        { receiverId: userId },
        { participants: userId },
      ],
    };

    const total = await CallLog.countDocuments(filter);
    const calls = await CallLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('callerId', 'firstName lastName profileImage')
      .populate('receiverId', 'firstName lastName profileImage')
      .populate('chatRoomId', 'name type groupImage')
      .lean();

    return {
      calls,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get Call Detail ───────────────────────────────
  readonly getCallDetail = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { callId } = req.params;

    const call = await CallLog.findById(callId)
      .populate('callerId', 'firstName lastName profileImage')
      .populate('receiverId', 'firstName lastName profileImage')
      .populate('participants', 'firstName lastName profileImage')
      .populate('chatRoomId', 'name type groupImage')
      .lean();

    if (!call) throw new HttpException(404, MESSAGING_MESSAGES.CALL_NOT_FOUND);

    return call;
  };
}
