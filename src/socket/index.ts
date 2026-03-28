import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/config';
import User from '@/models/mongoose/user.model';
import ChatRoom from '@/models/mongoose/chatRoom.model';
import ChatMessage from '@/models/mongoose/chatMessage.model';
import MessageReaction from '@/models/mongoose/messageReaction.model';
import { logger } from '@/utils/logger';

// ─── Track online users: userId → Set<socketId> ─────
const onlineUsers = new Map<string, Set<string>>();

// ─── Helper: Get socket IDs for a user ──────────────
const getUserSockets = (userId: string): string[] => {
  const sockets = onlineUsers.get(userId);
  return sockets ? Array.from(sockets) : [];
};

// ─── Helper: Check if user is online ────────────────
const isUserOnline = (userId: string): boolean => {
  const sockets = onlineUsers.get(userId);
  return !!sockets && sockets.size > 0;
};

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // ─── Auth Middleware ─────────────────────────────
  // Frontend connects with: io("url", { auth: { token: "Bearer xxx" } })
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      const decoded = jwt.verify(cleanToken, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId).select('_id firstName lastName profileImage');
      if (!user) return next(new Error('User not found'));

      (socket as any).userId = user._id.toString();
      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    const user = (socket as any).user;

    // ─── Register online user ───────────────────────
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    logger.info(`[Socket] User ${userId} connected (socket: ${socket.id})`);

    // Notify others that user is online
    socket.broadcast.emit('user:online', { userId });

    // ─── Join all chat rooms ────────────────────────
    // Auto-join socket to all user's chat rooms
    ChatRoom.find({ participants: userId, isActive: true })
      .select('_id')
      .lean()
      .then(rooms => {
        rooms.forEach(room => {
          socket.join(`room:${room._id}`);
        });
      });

    // ═══════════════════════════════════════════════
    //  MESSAGING EVENTS
    // ═══════════════════════════════════════════════

    // ─── Send Message ───────────────────────────────
    // Client emits: socket.emit("message:send", { roomId, messageType, message, mediaUrl, replyToMessageId })
    socket.on('message:send', async (data) => {
      try {
        const { roomId, messageType, message, mediaUrl, replyToMessageId } = data;

        // Verify participant
        const room = await ChatRoom.findOne({ _id: roomId, isActive: true });
        if (!room || !room.participants.some(id => id.toString() === userId)) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        // Save message to DB
        const chatMessage = await ChatMessage.create({
          chatRoomId: roomId,
          senderId: userId,
          messageType: messageType || 'TEXT',
          message: message || '',
          mediaUrl: mediaUrl || null,
          replyToMessageId: replyToMessageId || null,
        });

        // Update room last message
        room.lastMessage = messageType === 'TEXT' ? message : messageType;
        room.lastMessageAt = new Date();
        room.lastMessageType = messageType || 'TEXT';
        await room.save();

        // Populate sender info
        const populated = await ChatMessage.findById(chatMessage._id)
          .populate('senderId', 'firstName lastName profileImage')
          .populate('replyToMessageId', 'message senderId messageType')
          .lean();

        // Broadcast to all in room (including sender for confirmation)
        io.to(`room:${roomId}`).emit('message:received', {
          roomId,
          message: populated,
        });

      } catch (error: any) {
        logger.error('[Socket] message:send error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // ─── Edit Message ───────────────────────────────
    // Client emits: socket.emit("message:edit", { roomId, messageId, message })
    socket.on('message:edit', async (data) => {
      try {
        const { roomId, messageId, message } = data;

        const chatMessage = await ChatMessage.findOne({
          _id: messageId,
          chatRoomId: roomId,
          senderId: userId,
          isDeleted: false,
        });
        if (!chatMessage) return socket.emit('error', { message: 'Message not found' });

        chatMessage.message = message;
        chatMessage.isEdited = true;
        chatMessage.editedAt = new Date();
        await chatMessage.save();

        io.to(`room:${roomId}`).emit('message:edited', {
          roomId,
          messageId,
          message,
          isEdited: true,
          editedAt: chatMessage.editedAt,
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // ─── Delete Message ─────────────────────────────
    // Client emits: socket.emit("message:delete", { roomId, messageId })
    socket.on('message:delete', async (data) => {
      try {
        const { roomId, messageId } = data;

        const chatMessage = await ChatMessage.findOne({
          _id: messageId,
          chatRoomId: roomId,
          senderId: userId,
          isDeleted: false,
        });
        if (!chatMessage) return socket.emit('error', { message: 'Message not found' });

        chatMessage.isDeleted = true;
        await chatMessage.save();

        io.to(`room:${roomId}`).emit('message:deleted', {
          roomId,
          messageId,
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // ─── Add Reaction ───────────────────────────────
    // Client emits: socket.emit("message:react", { roomId, messageId, emoji })
    socket.on('message:react', async (data) => {
      try {
        const { roomId, messageId, emoji } = data;

        await MessageReaction.updateOne(
          { messageId, userId },
          { messageId, userId, emoji },
          { upsert: true }
        );

        io.to(`room:${roomId}`).emit('message:reacted', {
          roomId,
          messageId,
          userId,
          user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage },
          emoji,
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // ─── Remove Reaction ────────────────────────────
    socket.on('message:unreact', async (data) => {
      try {
        const { roomId, messageId } = data;

        await MessageReaction.deleteOne({ messageId, userId });

        io.to(`room:${roomId}`).emit('message:unreacted', {
          roomId,
          messageId,
          userId,
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // ═══════════════════════════════════════════════
    //  TYPING INDICATOR
    // ═══════════════════════════════════════════════

    // Client emits: socket.emit("typing:start", { roomId })
    socket.on('typing:start', (data) => {
      socket.to(`room:${data.roomId}`).emit('typing:started', {
        roomId: data.roomId,
        userId,
        user: { _id: user._id, firstName: user.firstName, lastName: user.lastName },
      });
    });

    // Client emits: socket.emit("typing:stop", { roomId })
    socket.on('typing:stop', (data) => {
      socket.to(`room:${data.roomId}`).emit('typing:stopped', {
        roomId: data.roomId,
        userId,
      });
    });

    // ═══════════════════════════════════════════════
    //  READ RECEIPTS
    // ═══════════════════════════════════════════════

    // Client emits: socket.emit("message:read", { roomId, messageIds })
    socket.on('message:read', async (data) => {
      try {
        const { roomId, messageIds } = data;

        await ChatMessage.updateMany(
          { _id: { $in: messageIds }, chatRoomId: roomId, isRead: false },
          { isRead: true }
        );

        socket.to(`room:${roomId}`).emit('message:read:ack', {
          roomId,
          messageIds,
          readBy: userId,
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // ═══════════════════════════════════════════════
    //  ONLINE STATUS
    // ═══════════════════════════════════════════════

    // Client asks: socket.emit("user:status", { userIds: ["id1", "id2"] })
    socket.on('user:status', (data) => {
      const { userIds } = data;
      const statuses = (userIds || []).map((id: string) => ({
        userId: id,
        online: isUserOnline(id),
      }));
      socket.emit('user:status:response', { statuses });
    });

    // ═══════════════════════════════════════════════
    //  ROOM MANAGEMENT (join new room in real-time)
    // ═══════════════════════════════════════════════

    // When user is added to a group via REST API, frontend calls this to join socket room
    socket.on('room:join', (data) => {
      socket.join(`room:${data.roomId}`);
    });

    socket.on('room:leave', (data) => {
      socket.leave(`room:${data.roomId}`);
    });

    // ═══════════════════════════════════════════════
    //  DISCONNECT
    // ═══════════════════════════════════════════════

    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // User is fully offline now — notify others
          socket.broadcast.emit('user:offline', { userId });
        }
      }
      logger.info(`[Socket] User ${userId} disconnected (socket: ${socket.id})`);
    });
  });

  return io;
};
