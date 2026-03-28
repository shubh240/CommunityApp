import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { NEWS_FEED_MESSAGES } from '@/messages/newsFeed.messages';
import NewsBookmark from '@/models/mongoose/newsBookmark.model';
import NewsTopic from '@/models/mongoose/newsTopic.model';
import NewsAuthorFollow from '@/models/mongoose/newsAuthorFollow.model';

export default class NewsFeedRepo {
  constructor() {}

  // ═══════════════════════════════════════════════════
  //  BOOKMARKS
  // ═══════════════════════════════════════════════════

  // ─── Toggle Bookmark ───────────────────────────────
  readonly toggleBookmark = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { articleUrl, title, description, imageUrl, sourceName, sourceLogo, publishedAt, category } = req.body;

    const existing = await NewsBookmark.findOne({ userId, articleUrl });

    if (existing) {
      await NewsBookmark.deleteOne({ _id: existing._id });
      return { bookmarked: false };
    } else {
      await NewsBookmark.create({
        userId,
        articleUrl,
        title,
        description,
        imageUrl,
        sourceName,
        sourceLogo,
        publishedAt: publishedAt || null,
        category,
      });
      return { bookmarked: true };
    }
  };

  // ─── Remove Bookmark by ID ─────────────────────────
  readonly removeBookmark = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { bookmarkId } = req.params;

    const bookmark = await NewsBookmark.findOne({ _id: bookmarkId, userId });
    if (!bookmark) throw new HttpException(404, 'Bookmark not found');

    await NewsBookmark.deleteOne({ _id: bookmark._id });
    return { removed: true };
  };

  // ─── Get My Bookmarks ──────────────────────────────
  readonly getBookmarks = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const category = req.query.category as string;

    const filter: any = { userId };
    if (category) filter.category = category;

    const total = await NewsBookmark.countDocuments(filter);
    const bookmarks = await NewsBookmark.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return {
      bookmarks,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ═══════════════════════════════════════════════════
  //  TOPICS
  // ═══════════════════════════════════════════════════

  // ─── Toggle Save Topic ─────────────────────────────
  readonly toggleTopic = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { topicSlug, topicName } = req.body;

    const existing = await NewsTopic.findOne({ userId, topicSlug });

    if (existing) {
      await NewsTopic.deleteOne({ _id: existing._id });
      return { saved: false, topicSlug };
    } else {
      await NewsTopic.create({ userId, topicSlug, topicName });
      return { saved: true, topicSlug };
    }
  };

  // ─── Remove Saved Topic ────────────────────────────
  readonly removeTopic = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { topicSlug } = req.params;

    await NewsTopic.deleteOne({ userId, topicSlug });
    return { removed: true };
  };

  // ─── Get My Saved Topics ──────────────────────────
  readonly getMyTopics = async (req: Request) => {
    const userId = req.userTokenData._id;

    const topics = await NewsTopic.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return { topics };
  };

  // ═══════════════════════════════════════════════════
  //  AUTHORS
  // ═══════════════════════════════════════════════════

  // ─── Toggle Follow Author ─────────────────────────
  readonly toggleFollowAuthor = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { authorSlug, authorName, authorLogo } = req.body;

    const existing = await NewsAuthorFollow.findOne({ userId, authorSlug });

    if (existing) {
      await NewsAuthorFollow.deleteOne({ _id: existing._id });
      return { following: false, authorSlug };
    } else {
      await NewsAuthorFollow.create({ userId, authorSlug, authorName, authorLogo });
      return { following: true, authorSlug };
    }
  };

  // ─── Unfollow Author ──────────────────────────────
  readonly unfollowAuthor = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { authorSlug } = req.params;

    await NewsAuthorFollow.deleteOne({ userId, authorSlug });
    return { unfollowed: true };
  };

  // ─── Get My Followed Authors ──────────────────────
  readonly getMyAuthors = async (req: Request) => {
    const userId = req.userTokenData._id;

    const authors = await NewsAuthorFollow.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return { authors };
  };

  // ═══════════════════════════════════════════════════
  //  SEARCH (across topics + authors)
  // ═══════════════════════════════════════════════════

  readonly search = async (req: Request) => {
    const userId = req.userTokenData._id;
    const q = (req.query.q as string || '').trim();
    const type = (req.query.type as string) || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    if (!q) return { topics: [], authors: [] };

    const result: any = {};

    if (type === 'all' || type === 'topics') {
      // Get user's saved topics to show save/unsave status
      const savedTopics = await NewsTopic.find({ userId }).select('topicSlug').lean();
      const savedSet = new Set(savedTopics.map(t => t.topicSlug));

      // Return topic suggestions matching query
      // Since topics aren't stored centrally, return user's matching saved topics
      const matchingTopics = await NewsTopic.find({
        topicName: { $regex: q, $options: 'i' },
      })
        .select('topicSlug topicName')
        .limit(pageSize)
        .lean();

      // Deduplicate by slug
      const uniqueTopics = new Map<string, any>();
      matchingTopics.forEach(t => {
        if (!uniqueTopics.has(t.topicSlug)) {
          uniqueTopics.set(t.topicSlug, {
            topicSlug: t.topicSlug,
            topicName: t.topicName,
            isSaved: savedSet.has(t.topicSlug),
          });
        }
      });

      result.topics = Array.from(uniqueTopics.values());
    }

    if (type === 'all' || type === 'authors') {
      const followedAuthors = await NewsAuthorFollow.find({ userId }).select('authorSlug').lean();
      const followedSet = new Set(followedAuthors.map(a => a.authorSlug));

      const matchingAuthors = await NewsAuthorFollow.find({
        authorName: { $regex: q, $options: 'i' },
      })
        .select('authorSlug authorName authorLogo')
        .limit(pageSize)
        .lean();

      const uniqueAuthors = new Map<string, any>();
      matchingAuthors.forEach(a => {
        if (!uniqueAuthors.has(a.authorSlug)) {
          uniqueAuthors.set(a.authorSlug, {
            authorSlug: a.authorSlug,
            authorName: a.authorName,
            authorLogo: a.authorLogo,
            isFollowing: followedSet.has(a.authorSlug),
          });
        }
      });

      result.authors = Array.from(uniqueAuthors.values());
    }

    return result;
  };
}
