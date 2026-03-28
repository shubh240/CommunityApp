import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

// ─── Post ────────────────────────────────────────────
export const createPostSchema = Joi.object({
  content: Joi.string().allow('').default(''),
  postType: Joi.string().valid('TEXT', 'IMAGE', 'VIDEO').default('TEXT'),
  visibility: Joi.string().valid('PUBLIC', 'FRIENDS', 'PRIVATE').default('PUBLIC'),
  feeling: Joi.string().allow('').default(''),
  checkin: Joi.object({
    location: Joi.string().allow('').default(''),
    latitude: Joi.number().default(0),
    longitude: Joi.number().default(0),
  }).allow(null).default(null),
  taggedUsers: Joi.array().items(objectId).default([]),
  media: Joi.array().items(
    Joi.object({
      mediaType: Joi.string().valid('IMAGE', 'VIDEO').required(),
      mediaUrl: Joi.string().required(),
      thumbnailUrl: Joi.string().allow('').optional(),
      duration: Joi.number().optional(),
      size: Joi.number().required(),
    })
  ).default([]),
});

export const updatePostSchema = Joi.object({
  content: Joi.string().allow('').optional(),
  visibility: Joi.string().valid('PUBLIC', 'FRIENDS', 'PRIVATE').optional(),
  feeling: Joi.string().allow('').optional(),
  checkin: Joi.object({
    location: Joi.string().allow('').default(''),
    latitude: Joi.number().default(0),
    longitude: Joi.number().default(0),
  }).allow(null).optional(),
  taggedUsers: Joi.array().items(objectId).optional(),
  removeMediaIds: Joi.array().items(objectId).optional(),
  addMedia: Joi.array().items(
    Joi.object({
      mediaType: Joi.string().valid('IMAGE', 'VIDEO').required(),
      mediaUrl: Joi.string().required(),
      thumbnailUrl: Joi.string().allow('').optional(),
      duration: Joi.number().optional(),
      size: Joi.number().required(),
    })
  ).optional(),
});

export const postIdParamSchema = Joi.object({
  postId: objectId.required(),
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
});

// ─── Comment ─────────────────────────────────────────
export const addCommentSchema = Joi.object({
  text: Joi.string().required(),
  parentCommentId: objectId.allow(null).optional(),
});

export const commentIdParamSchema = Joi.object({
  postId: objectId.required(),
  commentId: objectId.required(),
});

// ─── Story ───────────────────────────────────────────
export const createStorySchema = Joi.object({
  mediaType: Joi.string().valid('IMAGE', 'VIDEO').required(),
  mediaUrl: Joi.string().required(),
  thumbnailUrl: Joi.string().allow('').optional(),
});

export const storyIdParamSchema = Joi.object({
  storyId: objectId.required(),
});

// ─── Follow ──────────────────────────────────────────
export const userIdParamSchema = Joi.object({
  userId: objectId.required(),
});

export const followActionSchema = Joi.object({
  requestId: objectId.required(),
  action: Joi.string().valid('ACCEPTED', 'REJECTED').required(),
});

// ─── Search ──────────────────────────────────────────
export const searchQuerySchema = Joi.object({
  q: Joi.string().required(),
  type: Joi.string().valid('all', 'posts', 'users').default('all'),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
});

// ─── Notification ────────────────────────────────────
export const notificationIdParamSchema = Joi.object({
  notificationId: objectId.required(),
});

// ─── Report ──────────────────────────────────────────
export const reportSchema = Joi.object({
  reason: Joi.string().required(),
  description: Joi.string().allow('').optional(),
});

export const reportCommentParamSchema = Joi.object({
  commentId: objectId.required(),
});

// ─── Edit Comment ────────────────────────────────────
export const editCommentSchema = Joi.object({
  text: Joi.string().required(),
});
