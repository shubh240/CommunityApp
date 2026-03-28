import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

// ─── Chat Room ───────────────────────────────────────
export const createDirectChatSchema = Joi.object({
  receiverId: objectId.required(),
});

export const createGroupSchema = Joi.object({
  name: Joi.string().required(),
  groupImage: Joi.string().allow('').default(''),
  groupType: Joi.string().valid('PUBLIC', 'PRIVATE', 'PASSWORD').default('PUBLIC'),
  password: Joi.string().allow('').default(''),
  description: Joi.string().allow('').default(''),
  memberIds: Joi.array().items(objectId).default([]),
});

export const updateGroupSchema = Joi.object({
  name: Joi.string().optional(),
  groupImage: Joi.string().allow('').optional(),
  groupType: Joi.string().valid('PUBLIC', 'PRIVATE', 'PASSWORD').optional(),
  password: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
});

export const roomIdParamSchema = Joi.object({
  roomId: objectId.required(),
});

export const joinGroupSchema = Joi.object({
  password: Joi.string().allow('').optional(),
});

// ─── Group Members ───────────────────────────────────
export const addMembersSchema = Joi.object({
  memberIds: Joi.array().items(objectId).min(1).required(),
});

export const memberActionParamSchema = Joi.object({
  roomId: objectId.required(),
  userId: objectId.required(),
});

// ─── Message ─────────────────────────────────────────
export const sendMessageSchema = Joi.object({
  messageType: Joi.string().valid('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE').default('TEXT'),
  message: Joi.string().allow('').default(''),
  mediaUrl: Joi.string().allow('', null).default(null),
  replyToMessageId: objectId.allow(null).optional(),
});

export const editMessageSchema = Joi.object({
  message: Joi.string().required(),
});

export const messageIdParamSchema = Joi.object({
  roomId: objectId.required(),
  messageId: objectId.required(),
});

// ─── Reaction ────────────────────────────────────────
export const addReactionSchema = Joi.object({
  emoji: Joi.string().required(),
});

// ─── Call ────────────────────────────────────────────
export const createCallSchema = Joi.object({
  receiverId: objectId.optional(),
  chatRoomId: objectId.required(),
  callType: Joi.string().valid('VOICE', 'VIDEO').required(),
});

export const updateCallSchema = Joi.object({
  status: Joi.string().valid('OUTGOING', 'INCOMING', 'MISSED', 'REJECTED').optional(),
  duration: Joi.number().optional(),
  startedAt: Joi.date().iso().optional(),
  endedAt: Joi.date().iso().optional(),
  recordingUrl: Joi.string().allow('').optional(),
});

export const callIdParamSchema = Joi.object({
  callId: objectId.required(),
});

// ─── Common ─────────────────────────────────────────
export const messagingPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(20),
});

export const searchUsersSchema = Joi.object({
  q: Joi.string().required(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(20),
});

// ─── Mute ────────────────────────────────────────────
export const muteChatSchema = Joi.object({
  mutedUntil: Joi.date().iso().allow(null).default(null), // null = forever
});

// ─── Translate ───────────────────────────────────────
export const translateMessageSchema = Joi.object({
  targetLanguage: Joi.string().default('en'),
});
