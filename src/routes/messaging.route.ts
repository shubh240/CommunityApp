import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { MessagingController } from '@/controllers/messaging.controller';
import ChatRoomRepo from '@/repository/chatRoom.repository';
import ChatMessageRepo from '@/repository/chatMessage.repository';
import CallLogRepo from '@/repository/callLog.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { userAuthMiddleware } from '@/middlewares/userAuth.middleware';
import {
  createDirectChatSchema,
  createGroupSchema,
  updateGroupSchema,
  roomIdParamSchema,
  joinGroupSchema,
  addMembersSchema,
  memberActionParamSchema,
  sendMessageSchema,
  editMessageSchema,
  messageIdParamSchema,
  addReactionSchema,
  createCallSchema,
  updateCallSchema,
  callIdParamSchema,
  messagingPaginationSchema,
  searchUsersSchema,
  muteChatSchema,
} from '@/validationSchema/messaging.validation.schema';

class MessagingRoute implements Routes {
  public path = '/messaging';
  public router = Router();
  public controller = new MessagingController(
    new ChatRoomRepo(),
    new ChatMessageRepo(),
    new CallLogRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const auth = userAuthMiddleware();

    // ─── Chat Room Routes ───────────────────────────

    // Create direct chat
    this.router.post(
      `${this.path}/chats/direct`,
      auth,
      validationMiddleware(createDirectChatSchema, 'body'),
      this.controller.createDirectChat,
    );

    // Create group
    this.router.post(
      `${this.path}/chats/group`,
      auth,
      validationMiddleware(createGroupSchema, 'body'),
      this.controller.createGroup,
    );

    // Get my chat rooms (all)
    this.router.get(
      `${this.path}/chats`,
      auth,
      validationMiddleware(messagingPaginationSchema, 'query'),
      this.controller.getMyChatRooms,
    );

    // Get groups list
    this.router.get(
      `${this.path}/groups`,
      auth,
      validationMiddleware(messagingPaginationSchema, 'query'),
      this.controller.getGroups,
    );

    // Search users for chat
    this.router.get(
      `${this.path}/users/search`,
      auth,
      validationMiddleware(searchUsersSchema, 'query'),
      this.controller.searchUsers,
    );

    // Get unread message count
    this.router.get(
      `${this.path}/unread`,
      auth,
      this.controller.getUnreadCount,
    );

    // Get chat room detail
    this.router.get(
      `${this.path}/chats/:roomId`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      this.controller.getChatRoom,
    );

    // Update group
    this.router.put(
      `${this.path}/chats/:roomId`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      validationMiddleware(updateGroupSchema, 'body'),
      this.controller.updateGroup,
    );

    // Join group
    this.router.post(
      `${this.path}/chats/:roomId/join`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      validationMiddleware(joinGroupSchema, 'body'),
      this.controller.joinGroup,
    );

    // Leave group
    this.router.post(
      `${this.path}/chats/:roomId/leave`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      this.controller.leaveGroup,
    );

    // Delete group
    this.router.delete(
      `${this.path}/chats/:roomId`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      this.controller.deleteGroup,
    );

    // ─── Group Member Routes ────────────────────────

    // Get group members
    this.router.get(
      `${this.path}/chats/:roomId/members`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      this.controller.getGroupMembers,
    );

    // Add members
    this.router.post(
      `${this.path}/chats/:roomId/members`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      validationMiddleware(addMembersSchema, 'body'),
      this.controller.addMembers,
    );

    // Remove member
    this.router.delete(
      `${this.path}/chats/:roomId/members/:userId`,
      auth,
      validationMiddleware(memberActionParamSchema, 'params'),
      this.controller.removeMember,
    );

    // Ban member
    this.router.post(
      `${this.path}/chats/:roomId/ban/:userId`,
      auth,
      validationMiddleware(memberActionParamSchema, 'params'),
      this.controller.banMember,
    );

    // Unban member
    this.router.delete(
      `${this.path}/chats/:roomId/ban/:userId`,
      auth,
      validationMiddleware(memberActionParamSchema, 'params'),
      this.controller.unbanMember,
    );

    // ─── Message Routes ─────────────────────────────

    // Send message
    this.router.post(
      `${this.path}/chats/:roomId/messages`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      validationMiddleware(sendMessageSchema, 'body'),
      this.controller.sendMessage,
    );

    // Get messages
    this.router.get(
      `${this.path}/chats/:roomId/messages`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      validationMiddleware(messagingPaginationSchema, 'query'),
      this.controller.getMessages,
    );

    // Edit message
    this.router.put(
      `${this.path}/chats/:roomId/messages/:messageId`,
      auth,
      validationMiddleware(messageIdParamSchema, 'params'),
      validationMiddleware(editMessageSchema, 'body'),
      this.controller.editMessage,
    );

    // Delete message
    this.router.delete(
      `${this.path}/chats/:roomId/messages/:messageId`,
      auth,
      validationMiddleware(messageIdParamSchema, 'params'),
      this.controller.deleteMessage,
    );

    // ─── Reaction Routes ────────────────────────────

    // Add/Update reaction
    this.router.post(
      `${this.path}/chats/:roomId/messages/:messageId/reactions`,
      auth,
      validationMiddleware(messageIdParamSchema, 'params'),
      validationMiddleware(addReactionSchema, 'body'),
      this.controller.addReaction,
    );

    // Remove reaction
    this.router.delete(
      `${this.path}/chats/:roomId/messages/:messageId/reactions`,
      auth,
      validationMiddleware(messageIdParamSchema, 'params'),
      this.controller.removeReaction,
    );

    // Get reactions
    this.router.get(
      `${this.path}/chats/:roomId/messages/:messageId/reactions`,
      auth,
      validationMiddleware(messageIdParamSchema, 'params'),
      this.controller.getReactions,
    );

    // ─── Call Routes ────────────────────────────────

    // Create call log
    this.router.post(
      `${this.path}/calls`,
      auth,
      validationMiddleware(createCallSchema, 'body'),
      this.controller.createCall,
    );

    // Get call logs
    this.router.get(
      `${this.path}/calls`,
      auth,
      validationMiddleware(messagingPaginationSchema, 'query'),
      this.controller.getCallLogs,
    );

    // Get call detail
    this.router.get(
      `${this.path}/calls/:callId`,
      auth,
      validationMiddleware(callIdParamSchema, 'params'),
      this.controller.getCallDetail,
    );

    // Update call log
    this.router.put(
      `${this.path}/calls/:callId`,
      auth,
      validationMiddleware(callIdParamSchema, 'params'),
      validationMiddleware(updateCallSchema, 'body'),
      this.controller.updateCall,
    );

    // ─── Role Management Routes ─────────────────────

    // Make admin
    this.router.post(
      `${this.path}/chats/:roomId/admin/:userId`,
      auth,
      validationMiddleware(memberActionParamSchema, 'params'),
      this.controller.makeAdmin,
    );

    // Remove admin
    this.router.delete(
      `${this.path}/chats/:roomId/admin/:userId`,
      auth,
      validationMiddleware(memberActionParamSchema, 'params'),
      this.controller.removeAdmin,
    );

    // Make moderator
    this.router.post(
      `${this.path}/chats/:roomId/moderator/:userId`,
      auth,
      validationMiddleware(memberActionParamSchema, 'params'),
      this.controller.makeModerator,
    );

    // Remove moderator
    this.router.delete(
      `${this.path}/chats/:roomId/moderator/:userId`,
      auth,
      validationMiddleware(memberActionParamSchema, 'params'),
      this.controller.removeModerator,
    );

    // ─── Mute Routes ───────────────────────────────

    // Mute chat
    this.router.post(
      `${this.path}/chats/:roomId/mute`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      validationMiddleware(muteChatSchema, 'body'),
      this.controller.muteChat,
    );

    // Unmute chat
    this.router.delete(
      `${this.path}/chats/:roomId/mute`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      this.controller.unmuteChat,
    );

    // Get mute status
    this.router.get(
      `${this.path}/chats/:roomId/mute`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      this.controller.getMuteStatus,
    );

    // ─── Clear History ──────────────────────────────

    // Clear chat history
    this.router.delete(
      `${this.path}/chats/:roomId/history`,
      auth,
      validationMiddleware(roomIdParamSchema, 'params'),
      this.controller.clearChatHistory,
    );
  }
}

export default MessagingRoute;
