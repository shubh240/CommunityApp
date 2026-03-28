import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

// ─── Bookmark ────────────────────────────────────────
export const addBookmarkSchema = Joi.object({
  articleUrl: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow('').default(''),
  imageUrl: Joi.string().allow('').default(''),
  sourceName: Joi.string().allow('').default(''),
  sourceLogo: Joi.string().allow('').default(''),
  publishedAt: Joi.date().iso().optional(),
  category: Joi.string().allow('').default(''),
});

export const removeBookmarkSchema = Joi.object({
  articleUrl: Joi.string().required(),
});

export const bookmarkIdParamSchema = Joi.object({
  bookmarkId: objectId.required(),
});

// ─── Topic ───────────────────────────────────────────
export const saveTopicSchema = Joi.object({
  topicSlug: Joi.string().required(),
  topicName: Joi.string().required(),
});

export const topicSlugParamSchema = Joi.object({
  topicSlug: Joi.string().required(),
});

// ─── Author ──────────────────────────────────────────
export const followAuthorSchema = Joi.object({
  authorSlug: Joi.string().required(),
  authorName: Joi.string().required(),
  authorLogo: Joi.string().allow('').default(''),
});

export const authorSlugParamSchema = Joi.object({
  authorSlug: Joi.string().required(),
});

// ─── Pagination ──────────────────────────────────────
export const newsPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(20),
  category: Joi.string().allow('').optional(),
});

// ─── Search ──────────────────────────────────────────
export const newsSearchSchema = Joi.object({
  q: Joi.string().required(),
  type: Joi.string().valid('all', 'news', 'topics', 'authors').default('all'),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(50).default(20),
});
