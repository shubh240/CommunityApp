import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import PostRepo from '@/repository/post.repository';
import StoryRepo from '@/repository/story.repository';
import FollowRepo from '@/repository/follow.repository';
import NotificationRepo from '@/repository/notification.repository';
import BlockRepo, { BLOCK_MESSAGES } from '@/repository/block.repository';
import ReportRepo, { REPORT_MESSAGES } from '@/repository/report.repository';
import UserProfileRepo, { PROFILE_MESSAGES } from '@/repository/userProfile.repository';
import { POST_MESSAGES } from '@/messages/post.messages';

export class SocialMediaController {
  constructor(
    private readonly postRepo: PostRepo,
    private readonly storyRepo: StoryRepo,
    private readonly followRepo: FollowRepo,
    private readonly notificationRepo: NotificationRepo,
    private readonly blockRepo: BlockRepo,
    private readonly reportRepo: ReportRepo,
    private readonly userProfileRepo: UserProfileRepo,
  ) {}

  // ═══════════════════════════════════════════════════
  //  POST
  // ═══════════════════════════════════════════════════

  readonly createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.createPost(req);
      return generalResponse(res, result, POST_MESSAGES.POST_CREATED, 'success', true, 201);
    } catch (error) {
      next(error);
    }
  };

  readonly updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.updatePost(req);
      return generalResponse(res, result, POST_MESSAGES.POST_UPDATED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.deletePost(req);
      return generalResponse(res, result, POST_MESSAGES.POST_DELETED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.getPost(req);
      return generalResponse(res, result, POST_MESSAGES.POST_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.getFeed(req);
      return generalResponse(res, result, POST_MESSAGES.FEED_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly sharePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.sharePost(req);
      return generalResponse(res, result, POST_MESSAGES.POST_SHARED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.getUserPosts(req);
      return generalResponse(res, result, POST_MESSAGES.USER_POSTS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  LIKE
  // ═══════════════════════════════════════════════════

  readonly toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.toggleLike(req);
      const message = result.liked ? POST_MESSAGES.POST_LIKED : POST_MESSAGES.POST_UNLIKED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getPostLikes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.getPostLikes(req);
      return generalResponse(res, result, POST_MESSAGES.LIKES_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  COMMENT
  // ═══════════════════════════════════════════════════

  readonly addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.addComment(req);
      return generalResponse(res, result, POST_MESSAGES.COMMENT_ADDED, 'success', true, 201);
    } catch (error) {
      next(error);
    }
  };

  readonly getPostComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.getPostComments(req);
      return generalResponse(res, result, POST_MESSAGES.COMMENTS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.deleteComment(req);
      return generalResponse(res, result, POST_MESSAGES.COMMENT_DELETED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly editComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.editComment(req);
      return generalResponse(res, result, POST_MESSAGES.COMMENT_UPDATED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly toggleCommentLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.toggleCommentLike(req);
      const message = result.liked ? POST_MESSAGES.COMMENT_LIKED : POST_MESSAGES.COMMENT_UNLIKED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  SEARCH
  // ═══════════════════════════════════════════════════

  readonly search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.search(req);
      return generalResponse(res, result, POST_MESSAGES.SEARCH_RESULTS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  SAVE
  // ═══════════════════════════════════════════════════

  readonly toggleSave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.toggleSave(req);
      const message = result.saved ? POST_MESSAGES.POST_SAVED : POST_MESSAGES.POST_UNSAVED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getSavedPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.postRepo.getSavedPosts(req);
      return generalResponse(res, result, POST_MESSAGES.SAVED_POSTS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  STORY
  // ═══════════════════════════════════════════════════

  readonly createStory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.storyRepo.createStory(req);
      return generalResponse(res, result, POST_MESSAGES.STORY_CREATED, 'success', true, 201);
    } catch (error) {
      next(error);
    }
  };

  readonly deleteStory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.storyRepo.deleteStory(req);
      return generalResponse(res, result, POST_MESSAGES.STORY_DELETED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getStoriesFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.storyRepo.getStoriesFeed(req);
      return generalResponse(res, result, POST_MESSAGES.STORIES_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly viewStory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.storyRepo.viewStory(req);
      return generalResponse(res, result, POST_MESSAGES.STORY_VIEWED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getStoryViews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.storyRepo.getStoryViews(req);
      return generalResponse(res, result, POST_MESSAGES.STORY_VIEWS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  FOLLOW
  // ═══════════════════════════════════════════════════

  readonly sendFollowRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.followRepo.sendFollowRequest(req);
      return generalResponse(res, result, POST_MESSAGES.FOLLOW_REQUEST_SENT, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly respondToFollowRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.followRepo.respondToFollowRequest(req);
      const message = result.status === 'ACCEPTED'
        ? POST_MESSAGES.FOLLOW_REQUEST_ACCEPTED
        : POST_MESSAGES.FOLLOW_REQUEST_REJECTED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly unfollow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.followRepo.unfollow(req);
      return generalResponse(res, result, POST_MESSAGES.UNFOLLOWED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.followRepo.getFollowers(req);
      return generalResponse(res, result, POST_MESSAGES.FOLLOWERS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.followRepo.getFollowing(req);
      return generalResponse(res, result, POST_MESSAGES.FOLLOWING_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getFollowRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.followRepo.getFollowRequests(req);
      return generalResponse(res, result, POST_MESSAGES.FOLLOW_REQUESTS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly removeFollower = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.followRepo.removeFollower(req);
      return generalResponse(res, result, POST_MESSAGES.FOLLOWER_REMOVED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  NOTIFICATIONS
  // ═══════════════════════════════════════════════════

  readonly getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationRepo.getNotifications(req);
      return generalResponse(res, result, POST_MESSAGES.NOTIFICATIONS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationRepo.markAsRead(req);
      return generalResponse(res, result, POST_MESSAGES.NOTIFICATION_READ, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly markAllNotificationsAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationRepo.markAllAsRead(req);
      return generalResponse(res, result, POST_MESSAGES.ALL_NOTIFICATIONS_READ, 'success');
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  BLOCK
  // ═══════════════════════════════════════════════════

  readonly blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.blockRepo.blockUser(req);
      return generalResponse(res, result, BLOCK_MESSAGES.BLOCKED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.blockRepo.unblockUser(req);
      return generalResponse(res, result, BLOCK_MESSAGES.UNBLOCKED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getBlockedUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.blockRepo.getBlockedUsers(req);
      return generalResponse(res, result, BLOCK_MESSAGES.BLOCKED_USERS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  REPORT
  // ═══════════════════════════════════════════════════

  readonly reportPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reportRepo.reportPost(req);
      return generalResponse(res, result, REPORT_MESSAGES.REPORTED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly reportUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reportRepo.reportUser(req);
      return generalResponse(res, result, REPORT_MESSAGES.REPORTED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly reportComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reportRepo.reportComment(req);
      return generalResponse(res, result, REPORT_MESSAGES.REPORTED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  USER PROFILE & ACCOUNT
  // ═══════════════════════════════════════════════════

  readonly getProfileStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userProfileRepo.getProfileStats(req);
      return generalResponse(res, result, PROFILE_MESSAGES.PROFILE_STATS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly deactivateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userProfileRepo.deactivateAccount(req);
      return generalResponse(res, result, PROFILE_MESSAGES.ACCOUNT_DEACTIVATED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userProfileRepo.deleteAccount(req);
      return generalResponse(res, result, PROFILE_MESSAGES.ACCOUNT_DELETED, 'success', true);
    } catch (error) {
      next(error);
    }
  };
}
