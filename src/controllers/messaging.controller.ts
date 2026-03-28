import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import ChatRoomRepo from '@/repository/chatRoom.repository';
import ChatMessageRepo from '@/repository/chatMessage.repository';
import CallLogRepo from '@/repository/callLog.repository';
import { MESSAGING_MESSAGES } from '@/messages/messaging.messages';

export class MessagingController {
  constructor(
    private readonly roomRepo: ChatRoomRepo,
    private readonly messageRepo: ChatMessageRepo,
    private readonly callRepo: CallLogRepo,
  ) {}

  // ═══════════════════════════════════════════════════
  //  CHAT ROOM
  // ═══════════════════════════════════════════════════

  readonly createDirectChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.createDirectChat(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.ROOM_CREATED, 'success', true, 201);
    } catch (error) { next(error); }
  };

  readonly createGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.createGroup(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.GROUP_CREATED, 'success', true, 201);
    } catch (error) { next(error); }
  };

  readonly updateGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.updateGroup(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.GROUP_UPDATED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly getMyChatRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.getMyChatRooms(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.ROOMS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getChatRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.getChatRoom(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.ROOM_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.getGroups(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.ROOMS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  GROUP MANAGEMENT
  // ═══════════════════════════════════════════════════

  readonly addMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.addMembers(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MEMBER_ADDED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.removeMember(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MEMBER_REMOVED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly banMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.banMember(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MEMBER_BANNED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly unbanMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.unbanMember(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MEMBER_UNBANNED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.leaveGroup(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.LEFT_GROUP, 'success', true);
    } catch (error) { next(error); }
  };

  readonly deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.deleteGroup(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.GROUP_DELETED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly joinGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.joinGroup(req);
      return generalResponse(res, result, 'Joined group successfully', 'success', true);
    } catch (error) { next(error); }
  };

  readonly getGroupMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.getGroupMembers(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MEMBERS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.searchUsers(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.USERS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  MESSAGES
  // ═══════════════════════════════════════════════════

  readonly sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.messageRepo.sendMessage(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MESSAGE_SENT, 'success', true, 201);
    } catch (error) { next(error); }
  };

  readonly getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.messageRepo.getMessages(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MESSAGES_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly editMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.messageRepo.editMessage(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MESSAGE_UPDATED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.messageRepo.deleteMessage(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MESSAGE_DELETED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly addReaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.messageRepo.addReaction(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.REACTION_ADDED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly removeReaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.messageRepo.removeReaction(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.REACTION_REMOVED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly getReactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.messageRepo.getReactions(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.REACTIONS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.messageRepo.getUnreadCount(req);
      return generalResponse(res, result, 'Unread count fetched', 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  CALLS
  // ═══════════════════════════════════════════════════

  readonly createCall = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.callRepo.createCall(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.CALL_CREATED, 'success', true, 201);
    } catch (error) { next(error); }
  };

  readonly updateCall = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.callRepo.updateCall(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.CALL_UPDATED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly getCallLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.callRepo.getCallLogs(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.CALLS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly getCallDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.callRepo.getCallDetail(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.CALL_DETAIL_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  ROLE MANAGEMENT
  // ═══════════════════════════════════════════════════

  readonly makeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.makeAdmin(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MADE_ADMIN, 'success', true);
    } catch (error) { next(error); }
  };

  readonly removeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.removeAdmin(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.REMOVED_ADMIN, 'success', true);
    } catch (error) { next(error); }
  };

  readonly makeModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.makeModerator(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MADE_MODERATOR, 'success', true);
    } catch (error) { next(error); }
  };

  readonly removeModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.removeModerator(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.REMOVED_MODERATOR, 'success', true);
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  MUTE & CLEAR
  // ═══════════════════════════════════════════════════

  readonly muteChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.muteChat(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.CHAT_MUTED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly unmuteChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.unmuteChat(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.CHAT_UNMUTED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly getMuteStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.getMuteStatus(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.MUTE_STATUS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  readonly clearChatHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.roomRepo.clearChatHistory(req);
      return generalResponse(res, result, MESSAGING_MESSAGES.CHAT_CLEARED, 'success', true);
    } catch (error) { next(error); }
  };
}
