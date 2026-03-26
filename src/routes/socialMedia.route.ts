import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { SocialMediaController } from '@/controllers/socialMedia.controller';
import PostRepo from '@/repository/post.repository';
import StoryRepo from '@/repository/story.repository';
import FollowRepo from '@/repository/follow.repository';
import NotificationRepo from '@/repository/notification.repository';
import BlockRepo from '@/repository/block.repository';
import ReportRepo from '@/repository/report.repository';
import UserProfileRepo from '@/repository/userProfile.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { userAuthMiddleware } from '@/middlewares/userAuth.middleware';
import {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
  paginationQuerySchema,
  addCommentSchema,
  commentIdParamSchema,
  createStorySchema,
  storyIdParamSchema,
  userIdParamSchema,
  followActionSchema,
  searchQuerySchema,
  notificationIdParamSchema,
  reportSchema,
  reportCommentParamSchema,
  editCommentSchema,
} from '@/validationSchema/post.validation.schema';

class SocialMediaRoute implements Routes {
  public path = '/social';
  public router = Router();
  public controller = new SocialMediaController(
    new PostRepo(),
    new StoryRepo(),
    new FollowRepo(),
    new NotificationRepo(),
    new BlockRepo(),
    new ReportRepo(),
    new UserProfileRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const auth = userAuthMiddleware();

    // ─── Post Routes ────────────────────────────────
    this.router.post(
      `${this.path}/posts`,
      auth,
      validationMiddleware(createPostSchema, 'body'),
      this.controller.createPost,
    );

    this.router.put(
      `${this.path}/posts/:postId`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      validationMiddleware(updatePostSchema, 'body'),
      this.controller.updatePost,
    );

    this.router.delete(
      `${this.path}/posts/:postId`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      this.controller.deletePost,
    );

    this.router.get(
      `${this.path}/posts/feed`,
      auth,
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getFeed,
    );

    this.router.get(
      `${this.path}/posts/saved`,
      auth,
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getSavedPosts,
    );

    this.router.get(
      `${this.path}/posts/user/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getUserPosts,
    );

    this.router.get(
      `${this.path}/posts/:postId`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      this.controller.getPost,
    );

    // ─── Share Route ────────────────────────────────
    this.router.post(
      `${this.path}/posts/:postId/share`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      this.controller.sharePost,
    );

    // ─── Like Routes ────────────────────────────────
    this.router.post(
      `${this.path}/posts/:postId/like`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      this.controller.toggleLike,
    );

    this.router.get(
      `${this.path}/posts/:postId/likes`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getPostLikes,
    );

    // ─── Comment Routes ─────────────────────────────
    this.router.post(
      `${this.path}/posts/:postId/comments`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      validationMiddleware(addCommentSchema, 'body'),
      this.controller.addComment,
    );

    this.router.get(
      `${this.path}/posts/:postId/comments`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getPostComments,
    );

    this.router.delete(
      `${this.path}/posts/:postId/comments/:commentId`,
      auth,
      validationMiddleware(commentIdParamSchema, 'params'),
      this.controller.deleteComment,
    );

    this.router.put(
      `${this.path}/posts/:postId/comments/:commentId`,
      auth,
      validationMiddleware(commentIdParamSchema, 'params'),
      validationMiddleware(editCommentSchema, 'body'),
      this.controller.editComment,
    );

    this.router.post(
      `${this.path}/posts/:postId/comments/:commentId/like`,
      auth,
      validationMiddleware(commentIdParamSchema, 'params'),
      this.controller.toggleCommentLike,
    );

    // ─── Search Routes ─────────────────────────────
    this.router.get(
      `${this.path}/search`,
      auth,
      validationMiddleware(searchQuerySchema, 'query'),
      this.controller.search,
    );

    // ─── Save Routes ────────────────────────────────
    this.router.post(
      `${this.path}/posts/:postId/save`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      this.controller.toggleSave,
    );

    // ─── Story Routes ───────────────────────────────
    this.router.post(
      `${this.path}/stories`,
      auth,
      validationMiddleware(createStorySchema, 'body'),
      this.controller.createStory,
    );

    this.router.get(
      `${this.path}/stories/feed`,
      auth,
      this.controller.getStoriesFeed,
    );

    this.router.post(
      `${this.path}/stories/:storyId/view`,
      auth,
      validationMiddleware(storyIdParamSchema, 'params'),
      this.controller.viewStory,
    );

    this.router.get(
      `${this.path}/stories/:storyId/views`,
      auth,
      validationMiddleware(storyIdParamSchema, 'params'),
      this.controller.getStoryViews,
    );

    this.router.delete(
      `${this.path}/stories/:storyId`,
      auth,
      validationMiddleware(storyIdParamSchema, 'params'),
      this.controller.deleteStory,
    );

    // ─── Follow Routes ──────────────────────────────
    this.router.post(
      `${this.path}/follow/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.sendFollowRequest,
    );

    this.router.post(
      `${this.path}/follow/respond`,
      auth,
      validationMiddleware(followActionSchema, 'body'),
      this.controller.respondToFollowRequest,
    );

    this.router.delete(
      `${this.path}/follow/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.unfollow,
    );

    this.router.get(
      `${this.path}/followers/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getFollowers,
    );

    this.router.get(
      `${this.path}/following/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getFollowing,
    );

    this.router.get(
      `${this.path}/follow/requests`,
      auth,
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getFollowRequests,
    );

    this.router.delete(
      `${this.path}/follower/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.removeFollower,
    );

    // ─── Notification Routes ────────────────────────
    this.router.get(
      `${this.path}/notifications`,
      auth,
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getNotifications,
    );

    this.router.put(
      `${this.path}/notifications/:notificationId/read`,
      auth,
      validationMiddleware(notificationIdParamSchema, 'params'),
      this.controller.markNotificationAsRead,
    );

    this.router.put(
      `${this.path}/notifications/read-all`,
      auth,
      this.controller.markAllNotificationsAsRead,
    );

    // ─── Block Routes ───────────────────────────────
    this.router.post(
      `${this.path}/block/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.blockUser,
    );

    this.router.delete(
      `${this.path}/block/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.unblockUser,
    );

    this.router.get(
      `${this.path}/blocked-users`,
      auth,
      validationMiddleware(paginationQuerySchema, 'query'),
      this.controller.getBlockedUsers,
    );

    // ─── Report Routes ──────────────────────────────
    this.router.post(
      `${this.path}/report/post/:postId`,
      auth,
      validationMiddleware(postIdParamSchema, 'params'),
      validationMiddleware(reportSchema, 'body'),
      this.controller.reportPost,
    );

    this.router.post(
      `${this.path}/report/user/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      validationMiddleware(reportSchema, 'body'),
      this.controller.reportUser,
    );

    this.router.post(
      `${this.path}/report/comment/:commentId`,
      auth,
      validationMiddleware(reportCommentParamSchema, 'params'),
      validationMiddleware(reportSchema, 'body'),
      this.controller.reportComment,
    );

    // ─── Profile & Account Routes ───────────────────
    this.router.get(
      `${this.path}/profile/:userId`,
      auth,
      validationMiddleware(userIdParamSchema, 'params'),
      this.controller.getProfileStats,
    );

    this.router.get(
      `${this.path}/profile`,
      auth,
      this.controller.getProfileStats,
    );

    this.router.post(
      `${this.path}/account/deactivate`,
      auth,
      this.controller.deactivateAccount,
    );

    this.router.delete(
      `${this.path}/account`,
      auth,
      this.controller.deleteAccount,
    );
  }
}

export default SocialMediaRoute;
