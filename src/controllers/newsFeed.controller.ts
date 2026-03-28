import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import NewsFeedRepo from '@/repository/newsFeed.repository';
import { NEWS_FEED_MESSAGES } from '@/messages/newsFeed.messages';

export class NewsFeedController {
  constructor(private readonly repo: NewsFeedRepo) {}

  // ═══════════════════════════════════════════════════
  //  BOOKMARKS
  // ═══════════════════════════════════════════════════

  readonly toggleBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.toggleBookmark(req);
      const message = result.bookmarked ? NEWS_FEED_MESSAGES.BOOKMARKED : NEWS_FEED_MESSAGES.UNBOOKMARKED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) { next(error); }
  };

  readonly removeBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.removeBookmark(req);
      return generalResponse(res, result, NEWS_FEED_MESSAGES.UNBOOKMARKED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly getBookmarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.getBookmarks(req);
      return generalResponse(res, result, NEWS_FEED_MESSAGES.BOOKMARKS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  TOPICS
  // ═══════════════════════════════════════════════════

  readonly toggleTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.toggleTopic(req);
      const message = result.saved ? NEWS_FEED_MESSAGES.TOPIC_SAVED : NEWS_FEED_MESSAGES.TOPIC_UNSAVED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) { next(error); }
  };

  readonly removeTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.removeTopic(req);
      return generalResponse(res, result, NEWS_FEED_MESSAGES.TOPIC_UNSAVED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly getMyTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.getMyTopics(req);
      return generalResponse(res, result, NEWS_FEED_MESSAGES.MY_TOPICS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  AUTHORS
  // ═══════════════════════════════════════════════════

  readonly toggleFollowAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.toggleFollowAuthor(req);
      const message = result.following ? NEWS_FEED_MESSAGES.AUTHOR_FOLLOWED : NEWS_FEED_MESSAGES.AUTHOR_UNFOLLOWED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) { next(error); }
  };

  readonly unfollowAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.unfollowAuthor(req);
      return generalResponse(res, result, NEWS_FEED_MESSAGES.AUTHOR_UNFOLLOWED, 'success', true);
    } catch (error) { next(error); }
  };

  readonly getMyAuthors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.getMyAuthors(req);
      return generalResponse(res, result, NEWS_FEED_MESSAGES.MY_AUTHORS_FETCHED, 'success');
    } catch (error) { next(error); }
  };

  // ═══════════════════════════════════════════════════
  //  SEARCH
  // ═══════════════════════════════════════════════════

  readonly search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.repo.search(req);
      return generalResponse(res, result, NEWS_FEED_MESSAGES.SEARCH_RESULTS_FETCHED, 'success');
    } catch (error) { next(error); }
  };
}
