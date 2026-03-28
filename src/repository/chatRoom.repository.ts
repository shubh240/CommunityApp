import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { MESSAGING_MESSAGES } from '@/messages/messaging.messages';
import ChatRoom from '@/models/mongoose/chatRoom.model';
import User from '@/models/mongoose/user.model';
import Block from '@/models/mongoose/block.model';
import { sendNotification } from '@/helper/pushNotification.helper';
import ChatMessage from '@/models/mongoose/chatMessage.model';
import ChatMute from '@/models/mongoose/chatMute.model';
import BlockRepo from '@/repository/block.repository';

export default class ChatRoomRepo {
  constructor() {}

  // ─── Create Direct Chat ─────────────────────────────
  readonly createDirectChat = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { receiverId } = req.body;

    if (userId.toString() === receiverId) {
      throw new HttpException(400, MESSAGING_MESSAGES.CANNOT_CHAT_SELF);
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) throw new HttpException(404, 'User not found');

    // Check block
    const isBlocked = await Block.exists({
      $or: [
        { blockerId: userId, blockedId: receiverId },
        { blockerId: receiverId, blockedId: userId },
      ],
    });
    if (isBlocked) throw new HttpException(403, 'Cannot chat with this user');

    // Check if direct chat already exists
    const existing = await ChatRoom.findOne({
      type: 'DIRECT',
      participants: { $all: [userId, receiverId], $size: 2 },
      isActive: true,
    });
    if (existing) return existing;

    const room = await ChatRoom.create({
      type: 'DIRECT',
      participants: [userId, receiverId],
    });

    return room;
  };

  // ─── Create Group ───────────────────────────────────
  readonly createGroup = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { name, groupImage, groupType, password, description, memberIds } = req.body;

    const participants = [userId, ...memberIds.filter((id: string) => id !== userId.toString())];

    const room = await ChatRoom.create({
      type: 'GROUP',
      name,
      groupImage,
      groupType,
      password: groupType === 'PASSWORD' ? password : '',
      description,
      participants,
      ownerId: userId,
      adminIds: [userId],
    });

    // Notify added members
    for (const memberId of memberIds) {
      if (memberId !== userId.toString()) {
        await sendNotification({
          senderId: userId,
          receiverId: memberId,
          type: 'GROUP_ADDED',
          referenceId: room._id,
          title: 'Added to Group',
          message: `You were added to ${name}`,
        });
      }
    }

    return room;
  };

  // ─── Update Group ───────────────────────────────────
  readonly updateGroup = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;
    const { name, groupImage, groupType, password, description } = req.body;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.adminIds.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_ADMIN);
    }

    if (name !== undefined) room.name = name;
    if (groupImage !== undefined) room.groupImage = groupImage;
    if (groupType !== undefined) room.groupType = groupType;
    if (password !== undefined) room.password = password;
    if (description !== undefined) room.description = description;

    await room.save();
    return room;
  };

  // ─── Get My Chat Rooms ─────────────────────────────
  readonly getMyChatRooms = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const blockedIds = await BlockRepo.getBlockedIds(userId);

    const filter: any = {
      participants: userId,
      isActive: true,
    };

    const total = await ChatRoom.countDocuments(filter);
    const rooms = await ChatRoom.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('participants', 'firstName lastName profileImage')
      .populate('ownerId', 'firstName lastName profileImage')
      .lean();

    // Filter out blocked users from direct chats display
    const filtered = rooms.filter(room => {
      if (room.type === 'DIRECT') {
        const otherUser = room.participants.find(
          (p: any) => p._id.toString() !== userId.toString()
        );
        return otherUser && !blockedIds.includes((otherUser as any)._id.toString());
      }
      return true;
    });

    return {
      rooms: filtered,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get Chat Room Detail ──────────────────────────
  readonly getChatRoom = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, isActive: true })
      .populate('participants', 'firstName lastName profileImage')
      .populate('ownerId', 'firstName lastName profileImage')
      .populate('adminIds', 'firstName lastName profileImage')
      .lean();

    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.participants.some((p: any) => p._id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.ROOM_UNAUTHORIZED);
    }

    return room;
  };

  // ─── Add Members to Group ──────────────────────────
  readonly addMembers = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;
    const { memberIds } = req.body;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.adminIds.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_ADMIN);
    }

    const newMembers: string[] = [];
    for (const memberId of memberIds) {
      if (room.bannedMemberIds.some(id => id.toString() === memberId)) {
        continue; // skip banned members
      }
      if (!room.participants.some(id => id.toString() === memberId)) {
        room.participants.push(memberId);
        newMembers.push(memberId);
      }
    }

    await room.save();

    // Notify new members
    for (const memberId of newMembers) {
      await sendNotification({
        senderId: userId,
        receiverId: memberId,
        type: 'GROUP_ADDED',
        referenceId: room._id,
        title: 'Added to Group',
        message: `You were added to ${room.name}`,
      });
    }

    return { addedCount: newMembers.length };
  };

  // ─── Remove Member from Group ──────────────────────
  readonly removeMember = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, userId: targetUserId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.adminIds.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_ADMIN);
    }

    // Can't remove the owner
    if (room.ownerId?.toString() === targetUserId) {
      throw new HttpException(400, 'Cannot remove the group owner');
    }

    room.participants = room.participants.filter(id => id.toString() !== targetUserId);
    room.adminIds = room.adminIds.filter(id => id.toString() !== targetUserId);
    await room.save();

    return { removed: true };
  };

  // ─── Ban Member ────────────────────────────────────
  readonly banMember = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, userId: targetUserId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.adminIds.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_ADMIN);
    }

    if (room.ownerId?.toString() === targetUserId) {
      throw new HttpException(400, 'Cannot ban the group owner');
    }

    // Remove from participants + admins, add to banned
    room.participants = room.participants.filter(id => id.toString() !== targetUserId);
    room.adminIds = room.adminIds.filter(id => id.toString() !== targetUserId);
    if (!room.bannedMemberIds.some(id => id.toString() === targetUserId)) {
      room.bannedMemberIds.push(targetUserId as any);
    }

    await room.save();
    return { banned: true };
  };

  // ─── Unban Member ──────────────────────────────────
  readonly unbanMember = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, userId: targetUserId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.adminIds.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_ADMIN);
    }

    room.bannedMemberIds = room.bannedMemberIds.filter(id => id.toString() !== targetUserId);
    await room.save();

    return { unbanned: true };
  };

  // ─── Leave Group ───────────────────────────────────
  readonly leaveGroup = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);

    if (room.ownerId?.toString() === userId.toString()) {
      throw new HttpException(400, 'Owner cannot leave. Transfer ownership or delete the group.');
    }

    room.participants = room.participants.filter(id => id.toString() !== userId.toString());
    room.adminIds = room.adminIds.filter(id => id.toString() !== userId.toString());
    await room.save();

    return { left: true };
  };

  // ─── Delete Group ──────────────────────────────────
  readonly deleteGroup = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (room.ownerId?.toString() !== userId.toString()) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_OWNER);
    }

    room.isActive = false;
    await room.save();

    return { deleted: true };
  };

  // ─── Join Group ────────────────────────────────────
  readonly joinGroup = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);

    if (room.bannedMemberIds.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.USER_IS_BANNED);
    }

    if (room.participants.some(id => id.toString() === userId.toString())) {
      throw new HttpException(400, MESSAGING_MESSAGES.ALREADY_MEMBER);
    }

    if (room.groupType === 'PRIVATE') {
      throw new HttpException(403, 'This is a private group. You must be invited.');
    }

    if (room.groupType === 'PASSWORD' && room.password && password !== room.password) {
      throw new HttpException(400, MESSAGING_MESSAGES.WRONG_PASSWORD);
    }

    room.participants.push(userId);
    await room.save();

    return { joined: true };
  };

  // ─── Get Group Members ─────────────────────────────
  readonly getGroupMembers = async (req: Request) => {
    const { roomId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true })
      .populate('participants', 'firstName lastName profileImage')
      .populate('adminIds', 'firstName lastName profileImage')
      .populate('moderatorIds', 'firstName lastName profileImage')
      .populate('bannedMemberIds', 'firstName lastName profileImage')
      .populate('ownerId', 'firstName lastName profileImage')
      .lean();

    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);

    return {
      members: room.participants,
      admins: room.adminIds,
      moderators: room.moderatorIds,
      banned: room.bannedMemberIds,
      owner: room.ownerId,
      totalMembers: room.participants.length,
    };
  };

  // ─── Get Groups List ───────────────────────────────
  readonly getGroups = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const filter = { type: 'GROUP', participants: userId, isActive: true };
    const total = await ChatRoom.countDocuments(filter);
    const groups = await ChatRoom.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('ownerId', 'firstName lastName profileImage')
      .lean();

    const result = groups.map(g => ({
      ...g,
      memberCount: g.participants.length,
    }));

    return {
      groups: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Search Users for Chat ─────────────────────────
  readonly searchUsers = async (req: Request) => {
    const userId = req.userTokenData._id;
    const q = (req.query.q as string || '').trim();
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const blockedIds = await BlockRepo.getBlockedIds(userId);

    const filter = {
      _id: { $ne: userId, $nin: blockedIds },
      isActive: true,
      isBlocked: false,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
      ],
    };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('firstName lastName profileImage')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return {
      users,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Make Admin ────────────────────────────────────
  readonly makeAdmin = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, userId: targetUserId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (room.ownerId?.toString() !== userId.toString()
      && !room.adminIds.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_ADMIN);
    }

    if (!room.participants.some(id => id.toString() === targetUserId)) {
      throw new HttpException(400, MESSAGING_MESSAGES.NOT_A_MEMBER);
    }

    if (!room.adminIds.some(id => id.toString() === targetUserId)) {
      room.adminIds.push(targetUserId as any);
    }
    // Remove from moderator if was one
    room.moderatorIds = room.moderatorIds.filter(id => id.toString() !== targetUserId);

    await room.save();
    return { role: 'ADMIN' };
  };

  // ─── Remove Admin ─────────────────────────────────
  readonly removeAdmin = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, userId: targetUserId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);

    // Only owner can demote admins
    if (room.ownerId?.toString() !== userId.toString()) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_OWNER);
    }

    room.adminIds = room.adminIds.filter(id => id.toString() !== targetUserId);
    await room.save();

    return { role: 'MEMBER' };
  };

  // ─── Make Moderator ───────────────────────────────
  readonly makeModerator = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, userId: targetUserId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.adminIds.some(id => id.toString() === userId.toString())
      && room.ownerId?.toString() !== userId.toString()) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_ADMIN);
    }

    if (!room.participants.some(id => id.toString() === targetUserId)) {
      throw new HttpException(400, MESSAGING_MESSAGES.NOT_A_MEMBER);
    }

    if (!room.moderatorIds.some(id => id.toString() === targetUserId)) {
      room.moderatorIds.push(targetUserId as any);
    }

    await room.save();
    return { role: 'MODERATOR' };
  };

  // ─── Remove Moderator ─────────────────────────────
  readonly removeModerator = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId, userId: targetUserId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, type: 'GROUP', isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.adminIds.some(id => id.toString() === userId.toString())
      && room.ownerId?.toString() !== userId.toString()) {
      throw new HttpException(403, MESSAGING_MESSAGES.NOT_GROUP_ADMIN);
    }

    room.moderatorIds = room.moderatorIds.filter(id => id.toString() !== targetUserId);
    await room.save();

    return { role: 'MEMBER' };
  };

  // ─── Mute Chat ────────────────────────────────────
  readonly muteChat = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;
    const { mutedUntil } = req.body; // null = forever, or ISO date

    const room = await ChatRoom.findOne({ _id: roomId, isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.participants.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.ROOM_UNAUTHORIZED);
    }

    await ChatMute.updateOne(
      { userId, chatRoomId: roomId },
      { userId, chatRoomId: roomId, mutedUntil: mutedUntil || null },
      { upsert: true }
    );

    return { muted: true, mutedUntil: mutedUntil || 'forever' };
  };

  // ─── Unmute Chat ──────────────────────────────────
  readonly unmuteChat = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;

    await ChatMute.deleteOne({ userId, chatRoomId: roomId });

    return { muted: false };
  };

  // ─── Get Mute Status ──────────────────────────────
  readonly getMuteStatus = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;

    const mute = await ChatMute.findOne({ userId, chatRoomId: roomId }).lean();

    if (!mute) return { muted: false };

    // Check if mute has expired
    if (mute.mutedUntil && new Date(mute.mutedUntil) < new Date()) {
      await ChatMute.deleteOne({ _id: mute._id });
      return { muted: false };
    }

    return { muted: true, mutedUntil: mute.mutedUntil };
  };

  // ─── Clear Chat History ───────────────────────────
  // Soft-deletes all messages for this user in a chat room
  readonly clearChatHistory = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { roomId } = req.params;

    const room = await ChatRoom.findOne({ _id: roomId, isActive: true });
    if (!room) throw new HttpException(404, MESSAGING_MESSAGES.ROOM_NOT_FOUND);
    if (!room.participants.some(id => id.toString() === userId.toString())) {
      throw new HttpException(403, MESSAGING_MESSAGES.ROOM_UNAUTHORIZED);
    }

    // Soft delete all messages sent by this user in this room
    const result = await ChatMessage.updateMany(
      { chatRoomId: roomId, senderId: userId, isDeleted: false },
      { isDeleted: true }
    );

    return { clearedCount: result.modifiedCount };
  };
}
