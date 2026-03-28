import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { MESSAGING_MESSAGES } from '@/messages/messaging.messages';
import ChatRoom from '@/models/mongoose/chatRoom.model';
import ChatMessage from '@/models/mongoose/chatMessage.model';
import MessageReaction from '@/models/mongoose/messageReaction.model';
import { sendNotification } from '@/helper/pushNotification.helper';

export default class ChatMessageRepo {
  constructor() {}

  // ─── Helper: Verify user is participant ─────────────
  private readonly verifyParticipant = async (roomId: string | string[], userId: any) => {
    const room = await ChatRoom.findOne({ _id: roomId, isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.participants.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.ROOM_UNAUTHORIZED);
    }
    return room;
  };

  // ─── Send Message ──────────────────────────────────
  readonly sendMessage = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;
    const { messageType, message, mediaUrl, replyToMessageId } = req.body;

    const room = await this.verifyParticipant(roomId, userId);

    const chatMessage = await ChatMessage.create({
      chatRoomId: roomId,
      senderId: userId,
      messageType,
      message,
      mediaUrl,
      replyToMessageId: replyToMessageId || null,
    });

    // Update room's last message
    room.lastMessage = messageType === 'TEXT' ? message : messageType;
    room.lastMessageAt = new Date();
    room.lastMessageType = messageType;
    await room.save();

    // Notify other participants
    const otherParticipants = room.participants.filter(
      id => id.toString() !== userId.toString()
    );
    for (const participantId of otherParticipants) {
      await sendNotification({
        senderId: userId,
        receiverId: participantId,
        type: 'CHAT_MESSAGE',
        referenceId: chatMessage._id,
        title: room.type === 'GROUP' ? room.name : 'New Message',
        message: messageType === 'TEXT' ? message : `Sent a ${messageType.toLowerCase()}`,
      });
    }

    const populated = await ChatMessage.findById(chatMessage._id)
      .populate('senderId', 'firstName lastName profileImage')
      .populate('replyToMessageId', 'message senderId messageType')
      .lean();

    return populated;
  };

  // ─── Get Messages ──────────────────────────────────
  readonly getMessages = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    await this.verifyParticipant(roomId, userId);

    const filter = { chatRoomId: roomId, isDeleted: false };
    const total = await ChatMessage.countDocuments(filter);
    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('senderId', 'firstName lastName profileImage')
      .populate('replyToMessageId', 'message senderId messageType')
      .lean();

    // Fetch reactions for all messages in batch
    const messageIds = messages.map(m => m._id);
    const reactions = await MessageReaction.find({ messageId: { $in: messageIds } })
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    const reactionMap = new Map<string, any[]>();
    reactions.forEach(r => {
      const key = r.messageId.toString();
      if (!reactionMap.has(key)) reactionMap.set(key, []);
      reactionMap.get(key)!.push({ emoji: r.emoji, user: r.userId });
    });

    const messagesWithReactions = messages.map(m => ({
      ...m,
      reactions: reactionMap.get(m._id.toString()) || [],
    }));

    // Mark messages as read
    await ChatMessage.updateMany(
      { chatRoomId: roomId, senderId: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    return {
      messages: messagesWithReactions,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Edit Message ──────────────────────────────────
  readonly editMessage = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, messageId } = req.params;
    const { message } = req.body;

    await this.verifyParticipant(roomId, userId);

    const chatMessage = await ChatMessage.findOne({
      _id: messageId,
      chatRoomId: roomId,
      isDeleted: false,
    });
    if (!chatMessage) throw new HttpException(404, MESSAGING_MESSAGES.MESSAGE_NOT_FOUND);
    if (chatMessage.senderId.toString() !== userId.toString()) {
      throw new HttpException(403, MESSAGING_MESSAGES.MESSAGE_UNAUTHORIZED);
    }

    chatMessage.message = message;
    chatMessage.isEdited = true;
    chatMessage.editedAt = new Date();
    await chatMessage.save();

    return chatMessage;
  };

  // ─── Delete Message ────────────────────────────────
  readonly deleteMessage = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, messageId } = req.params;

    await this.verifyParticipant(roomId, userId);

    const chatMessage = await ChatMessage.findOne({
      _id: messageId,
      chatRoomId: roomId,
      isDeleted: false,
    });
    if (!chatMessage) throw new HttpException(404, MESSAGING_MESSAGES.MESSAGE_NOT_FOUND);
    if (chatMessage.senderId.toString() !== userId.toString()) {
      throw new HttpException(403, MESSAGING_MESSAGES.MESSAGE_UNAUTHORIZED);
    }

    chatMessage.isDeleted = true;
    await chatMessage.save();

    return { messageId };
  };

  // ─── Add / Update Reaction ─────────────────────────
  readonly addReaction = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, messageId } = req.params;
    const { emoji } = req.body;

    await this.verifyParticipant(roomId, userId);

    const chatMessage = await ChatMessage.findOne({
      _id: messageId,
      chatRoomId: roomId,
      isDeleted: false,
    });
    if (!chatMessage) throw new HttpException(404, MESSAGING_MESSAGES.MESSAGE_NOT_FOUND);

    // Upsert reaction (one per user per message)
    await MessageReaction.updateOne(
      { messageId, userId },
      { messageId, userId, emoji },
      { upsert: true }
    );

    return { emoji };
  };

  // ─── Remove Reaction ──────────────────────────────
  readonly removeReaction = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, messageId } = req.params;

    await this.verifyParticipant(roomId, userId);

    await MessageReaction.deleteOne({ messageId, userId });

    return { removed: true };
  };

  // ─── Get Message Reactions ─────────────────────────
  readonly getReactions = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, messageId } = req.params;

    await this.verifyParticipant(roomId, userId);

    const reactions = await MessageReaction.find({ messageId })
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    return { reactions };
  };

  // ─── Get Unread Count ──────────────────────────────
  readonly getUnreadCount = async (req: Request) => {
    const userId = req.userTokenData._id;

    // Get all rooms user is part of
    const rooms = await ChatRoom.find({ participants: userId, isActive: true }).select('_id').lean();
    const roomIds = rooms.map(r => r._id);

    const unreadCount = await ChatMessage.countDocuments({
      chatRoomId: { $in: roomIds },
      senderId: { $ne: userId },
      isRead: false,
      isDeleted: false,
    });

    return { unreadCount };
  };
}
