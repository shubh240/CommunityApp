import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { NewsFeedController } from '@/controllers/newsFeed.controller';
import NewsFeedRepo from '@/repository/newsFeed.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { userAuthMiddleware } from '@/middlewares/userAuth.middleware';
import {
  addBookmarkSchema,
  bookmarkIdParamSchema,
  saveTopicSchema,
  topicSlugParamSchema,
  followAuthorSchema,
  authorSlugParamSchema,
  newsPaginationSchema,
  newsSearchSchema,
} from '@/validationSchema/newsFeed.validation.schema';

class NewsFeedRoute implements Routes {
  public path = '/news';
  public router = Router();
  public controller = new NewsFeedController(new NewsFeedRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const auth = userAuthMiddleware();

    // ─── Bookmark Routes ────────────────────────────

    // Toggle bookmark (add/remove)
    this.router.post(
      `${this.path}/bookmarks`,
      auth,
      validationMiddleware(addBookmarkSchema, 'body'),
      this.controller.toggleBookmark,
    );

    // Get my bookmarks
    this.router.get(
      `${this.path}/bookmarks`,
      auth,
      validationMiddleware(newsPaginationSchema, 'query'),
      this.controller.getBookmarks,
    );

    // Remove bookmark by ID
    this.router.delete(
      `${this.path}/bookmarks/:bookmarkId`,
      auth,
      validationMiddleware(bookmarkIdParamSchema, 'params'),
      this.controller.removeBookmark,
    );

    // ─── Topic Routes ───────────────────────────────

    // Toggle save topic
    this.router.post(
      `${this.path}/topics`,
      auth,
      validationMiddleware(saveTopicSchema, 'body'),
      this.controller.toggleTopic,
    );

    // Get my saved topics
    this.router.get(
      `${this.path}/topics/me`,
      auth,
      this.controller.getMyTopics,
    );

    // Remove saved topic
    this.router.delete(
      `${this.path}/topics/:topicSlug`,
      auth,
      validationMiddleware(topicSlugParamSchema, 'params'),
      this.controller.removeTopic,
    );

    // ─── Author Routes ──────────────────────────────

    // Toggle follow author
    this.router.post(
      `${this.path}/authors`,
      auth,
      validationMiddleware(followAuthorSchema, 'body'),
      this.controller.toggleFollowAuthor,
    );

    // Get my followed authors
    this.router.get(
      `${this.path}/authors/me`,
      auth,
      this.controller.getMyAuthors,
    );

    // Unfollow author
    this.router.delete(
      `${this.path}/authors/:authorSlug`,
      auth,
      validationMiddleware(authorSlugParamSchema, 'params'),
      this.controller.unfollowAuthor,
    );

    // ─── Search ─────────────────────────────────────

    // Search topics + authors
    this.router.get(
      `${this.path}/search`,
      auth,
      validationMiddleware(newsSearchSchema, 'query'),
      this.controller.search,
    );
  }
}

export default NewsFeedRoute;
