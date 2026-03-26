import type { Request } from 'express';
import mongoose from 'mongoose';
import { HttpException } from '@/exceptions/HttpException';
import { POST_MESSAGES } from '@/messages/post.messages';
import Post from '@/models/mongoose/post.model';
import PostMedia from '@/models/mongoose/postMedia.model';
import PostLike from '@/models/mongoose/postLike.model';
import PostComment from '@/models/mongoose/postComment.model';
import PostSaved from '@/models/mongoose/postSaved.model';
import CommentLike from '@/models/mongoose/commentLike.model';
import Notification from '@/models/mongoose/notification.model';
import Follow from '@/models/mongoose/follow.model';
import User from '@/models/mongoose/user.model';
import BlockRepo from '@/repository/block.repository';

export default class PostRepo {
  constructor() {}

  // ─── Create Post ─────────────────────────────────────
  readonly createPost = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { content, postType, visibility, feeling, checkin, taggedUsers, media } = req.body;

    const post = await Post.create({
      userId,
      content,
      postType,
      visibility,
      feeling,
      checkin,
      taggedUsers,
    });

    // Insert media if provided
    if (media && media.length > 0) {
      const mediaRecords = media.map((m: any) => ({
        postId: post._id,
        mediaType: m.mediaType,
        mediaUrl: m.mediaUrl,
        thumbnailUrl: m.thumbnailUrl || null,
        duration: m.duration || null,
        size: m.size,
      }));
      await PostMedia.insertMany(mediaRecords);
    }

    const postWithMedia = await Post.findById(post._id).lean();
    const mediaList = await PostMedia.find({ postId: post._id, isDeleted: false }).lean();

    return { ...postWithMedia, media: mediaList };
  };

  // ─── Update Post ─────────────────────────────────────
  readonly updatePost = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { postId } = req.params;
    const { content, visibility, feeling, checkin, taggedUsers, addMedia, removeMediaIds } = req.body;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new HttpException(404, POST_MESSAGES.POST_NOT_FOUND);
    if (post.userId.toString() !== userId.toString()) {
      throw new HttpException(403, POST_MESSAGES.POST_UNAUTHORIZED);
    }

    if (content !== undefined) post.content = content;
    if (visibility !== undefined) post.visibility = visibility;
    if (feeling !== undefined) post.feeling = feeling;
    if (checkin !== undefined) post.checkin = checkin;
    if (taggedUsers !== undefined) post.taggedUsers = taggedUsers;

    await post.save();

    // Remove specific media (soft delete)
    if (removeMediaIds && removeMediaIds.length > 0) {
      await PostMedia.updateMany(
        { _id: { $in: removeMediaIds }, postId, isDeleted: false },
        { isDeleted: true }
      );
    }

    // Add new media
    if (addMedia && addMedia.length > 0) {
      const mediaRecords = addMedia.map((m: any) => ({
        postId: post._id,
        mediaType: m.mediaType,
        mediaUrl: m.mediaUrl,
        thumbnailUrl: m.thumbnailUrl || null,
        duration: m.duration || null,
        size: m.size,
      }));
      await PostMedia.insertMany(mediaRecords);
    }

    const mediaList = await PostMedia.find({ postId: post._id, isDeleted: false }).lean();
    return { ...post.toObject(), media: mediaList };
  };

  // ─── Delete Post ─────────────────────────────────────
  readonly deletePost = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new HttpException(404, POST_MESSAGES.POST_NOT_FOUND);
    if (post.userId.toString() !== userId.toString()) {
      throw new HttpException(403, POST_MESSAGES.POST_UNAUTHORIZED);
    }

    post.isDeleted = true;
    await post.save();

    // Soft delete media
    await PostMedia.updateMany({ postId }, { isDeleted: true });

    return { postId };
  };

  // ─── Get Single Post ────────────────────────────────
  readonly getPost = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, isDeleted: false })
      .populate('userId', 'firstName lastName profileImage')
      .populate('taggedUsers', 'firstName lastName profileImage')
      .lean();

    if (!post) throw new HttpException(404, POST_MESSAGES.POST_NOT_FOUND);

    const media = await PostMedia.find({ postId, isDeleted: false }).lean();
    const isLiked = await PostLike.exists({ postId, userId });
    const isSaved = await PostSaved.exists({ postId, userId });

    return { ...post, media, isLiked: !!isLiked, isSaved: !!isSaved };
  };

  // ─── Get Feed (Home + Videos tab) ───────────────────
  readonly getFeed = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const postType = req.query.postType as string; // optional filter: 'VIDEO' for videos tab

    // Get blocked user IDs + following
    const [blockedIds, following] = await Promise.all([
      BlockRepo.getBlockedIds(userId),
      Follow.find({ requesterId: userId, status: 'ACCEPTED' }).select('receiverId').lean(),
    ]);
    const followingIds = following.map(f => f.receiverId);

    // Feed includes: own posts + followed users' public/friends posts + all public posts
    // Exclude blocked users
    const filter: any = {
      isDeleted: false,
      userId: { $nin: blockedIds },
      $or: [
        { userId }, // own posts
        { userId: { $in: followingIds }, visibility: { $in: ['PUBLIC', 'FRIENDS'] } },
        { visibility: 'PUBLIC' },
      ],
    };

    if (postType) {
      filter.postType = postType;
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('userId', 'firstName lastName profileImage')
      .populate('taggedUsers', 'firstName lastName profileImage')
      .lean();

    // Fetch media, likes, saves for all posts in batch
    const postIds = posts.map(p => p._id);
    const [allMedia, userLikes, userSaves] = await Promise.all([
      PostMedia.find({ postId: { $in: postIds }, isDeleted: false }).lean(),
      PostLike.find({ postId: { $in: postIds }, userId }).select('postId').lean(),
      PostSaved.find({ postId: { $in: postIds }, userId }).select('postId').lean(),
    ]);

    const mediaMap = new Map<string, any[]>();
    allMedia.forEach(m => {
      const key = m.postId.toString();
      if (!mediaMap.has(key)) mediaMap.set(key, []);
      mediaMap.get(key)!.push(m);
    });

    const likedSet = new Set(userLikes.map(l => l.postId.toString()));
    const savedSet = new Set(userSaves.map(s => s.postId.toString()));

    const feed = posts.map(post => ({
      ...post,
      media: mediaMap.get(post._id.toString()) || [],
      isLiked: likedSet.has(post._id.toString()),
      isSaved: savedSet.has(post._id.toString()),
    }));

    return {
      posts: feed,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  };

  // ─── Like / Unlike ──────────────────────────────────
  readonly toggleLike = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new HttpException(404, POST_MESSAGES.POST_NOT_FOUND);

    const existing = await PostLike.findOne({ postId, userId });

    if (existing) {
      // Unlike
      await PostLike.deleteOne({ _id: existing._id });
      await Post.updateOne({ _id: postId }, { $inc: { likeCount: -1 } });
      return { liked: false, likeCount: post.likeCount - 1 };
    } else {
      // Like
      await PostLike.create({ postId, userId });
      await Post.updateOne({ _id: postId }, { $inc: { likeCount: 1 } });

      // Notify post owner (if not self)
      if (post.userId.toString() !== userId.toString()) {
        await Notification.create({
          senderId: userId,
          receiverId: post.userId,
          type: 'POST_LIKE',
          referenceId: post._id,
          title: 'Post Liked',
          message: 'liked your post',
        });
      }

      return { liked: true, likeCount: post.likeCount + 1 };
    }
  };

  // ─── Get Post Likes ─────────────────────────────────
  readonly getPostLikes = async (req: Request) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const total = await PostLike.countDocuments({ postId });
    const likes = await PostLike.find({ postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    return {
      likes: likes.map(l => l.userId),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Add Comment ────────────────────────────────────
  readonly addComment = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { postId } = req.params;
    const { text, parentCommentId } = req.body;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new HttpException(404, POST_MESSAGES.POST_NOT_FOUND);

    // Validate parent comment if replying
    if (parentCommentId) {
      const parent = await PostComment.findOne({ _id: parentCommentId, postId, isDeleted: false });
      if (!parent) throw new HttpException(404, POST_MESSAGES.COMMENT_NOT_FOUND);
    }

    const comment = await PostComment.create({
      postId,
      userId,
      parentCommentId: parentCommentId || null,
      text,
    });

    await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

    // Notify post owner
    if (post.userId.toString() !== userId.toString()) {
      await Notification.create({
        senderId: userId,
        receiverId: post.userId,
        type: 'POST_COMMENT',
        referenceId: post._id,
        title: 'New Comment',
        message: 'commented on your post',
      });
    }

    const populated = await PostComment.findById(comment._id)
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    return populated;
  };

  // ─── Get Post Comments ──────────────────────────────
  readonly getPostComments = async (req: Request) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    // Get top-level comments
    const filter = { postId, parentCommentId: null, isDeleted: false };
    const total = await PostComment.countDocuments(filter);

    const comments = await PostComment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    // Fetch replies for each comment
    const commentIds = comments.map(c => c._id);
    const replies = await PostComment.find({
      parentCommentId: { $in: commentIds },
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    const replyMap = new Map<string, any[]>();
    replies.forEach(r => {
      const key = r.parentCommentId!.toString();
      if (!replyMap.has(key)) replyMap.set(key, []);
      replyMap.get(key)!.push(r);
    });

    const commentsWithReplies = comments.map(c => ({
      ...c,
      replies: replyMap.get(c._id.toString()) || [],
    }));

    return {
      comments: commentsWithReplies,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Delete Comment ─────────────────────────────────
  readonly deleteComment = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { commentId, postId } = req.params;

    const comment = await PostComment.findOne({ _id: commentId, postId, isDeleted: false });
    if (!comment) throw new HttpException(404, POST_MESSAGES.COMMENT_NOT_FOUND);
    if (comment.userId.toString() !== userId.toString()) {
      throw new HttpException(403, POST_MESSAGES.COMMENT_UNAUTHORIZED);
    }

    comment.isDeleted = true;
    await comment.save();

    await Post.updateOne({ _id: postId }, { $inc: { commentCount: -1 } });

    return { commentId };
  };

  // ─── Edit Comment ─────────────────────────────────
  readonly editComment = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { commentId, postId } = req.params;
    const { text } = req.body;

    const comment = await PostComment.findOne({ _id: commentId, postId, isDeleted: false });
    if (!comment) throw new HttpException(404, POST_MESSAGES.COMMENT_NOT_FOUND);
    if (comment.userId.toString() !== userId.toString()) {
      throw new HttpException(403, POST_MESSAGES.COMMENT_UNAUTHORIZED);
    }

    comment.text = text;
    await comment.save();

    const populated = await PostComment.findById(comment._id)
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    return populated;
  };

  // ─── Like / Unlike Comment ──────────────────────────
  readonly toggleCommentLike = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { commentId, postId } = req.params;

    const comment = await PostComment.findOne({ _id: commentId, postId, isDeleted: false });
    if (!comment) throw new HttpException(404, POST_MESSAGES.COMMENT_NOT_FOUND);

    const existing = await CommentLike.findOne({ commentId, userId });

    if (existing) {
      await CommentLike.deleteOne({ _id: existing._id });
      return { liked: false };
    } else {
      await CommentLike.create({ commentId, userId });
      return { liked: true };
    }
  };

  // ─── Search Posts & Users ───────────────────────────
  readonly search = async (req: Request) => {
    const userId = req.userTokenData._id;
    const query = (req.query.q as string || '').trim();
    const type = (req.query.type as string) || 'all'; // 'all', 'posts', 'users'
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    if (!query) {
      return { posts: [], users: [], pagination: { page, pageSize, total: 0, totalPages: 0 } };
    }

    const result: any = {};

    if (type === 'all' || type === 'users') {
      const userFilter = {
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
        ],
        isBlocked: false,
        isActive: true,
      };

      const totalUsers = await User.countDocuments(userFilter);
      const users = await User.find(userFilter)
        .select('firstName lastName profileImage')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();

      // Check follow status for each user
      const userIds = users.map(u => u._id);
      const follows = await Follow.find({
        requesterId: userId,
        receiverId: { $in: userIds },
      }).select('receiverId status').lean();

      const followMap = new Map(follows.map(f => [f.receiverId.toString(), f.status]));

      result.users = users.map(u => ({
        ...u,
        followStatus: followMap.get(u._id.toString()) || null,
      }));
      result.usersPagination = { page, pageSize, total: totalUsers, totalPages: Math.ceil(totalUsers / pageSize) };
    }

    if (type === 'all' || type === 'posts') {
      const postFilter = {
        content: { $regex: query, $options: 'i' },
        isDeleted: false,
        visibility: 'PUBLIC',
      };

      const totalPosts = await Post.countDocuments(postFilter);
      const posts = await Post.find(postFilter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('userId', 'firstName lastName profileImage')
        .lean();

      const postIds = posts.map(p => p._id);
      const [allMedia, userLikes, userSaves] = await Promise.all([
        PostMedia.find({ postId: { $in: postIds }, isDeleted: false }).lean(),
        PostLike.find({ postId: { $in: postIds }, userId }).select('postId').lean(),
        PostSaved.find({ postId: { $in: postIds }, userId }).select('postId').lean(),
      ]);

      const mediaMap = new Map<string, any[]>();
      allMedia.forEach(m => {
        const key = m.postId.toString();
        if (!mediaMap.has(key)) mediaMap.set(key, []);
        mediaMap.get(key)!.push(m);
      });

      const likedSet = new Set(userLikes.map(l => l.postId.toString()));
      const savedSet = new Set(userSaves.map(s => s.postId.toString()));

      result.posts = posts.map(post => ({
        ...post,
        media: mediaMap.get(post._id.toString()) || [],
        isLiked: likedSet.has(post._id.toString()),
        isSaved: savedSet.has(post._id.toString()),
      }));
      result.postsPagination = { page, pageSize, total: totalPosts, totalPages: Math.ceil(totalPosts / pageSize) };
    }

    return result;
  };

  // ─── Save / Unsave Post ─────────────────────────────
  readonly toggleSave = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new HttpException(404, POST_MESSAGES.POST_NOT_FOUND);

    const existing = await PostSaved.findOne({ postId, userId });

    if (existing) {
      await PostSaved.deleteOne({ _id: existing._id });
      return { saved: false };
    } else {
      await PostSaved.create({ postId, userId });
      return { saved: true };
    }
  };

  // ─── Get Saved Posts ────────────────────────────────
  readonly getSavedPosts = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const total = await PostSaved.countDocuments({ userId });
    const saved = await PostSaved.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate({
        path: 'postId',
        match: { isDeleted: false },
        populate: { path: 'userId', select: 'firstName lastName profileImage' },
      })
      .lean();

    // Filter out nulls (deleted posts)
    const posts = saved.filter(s => s.postId !== null);

    // Get media for saved posts
    const postIds = posts.map((s: any) => s.postId._id);
    const allMedia = await PostMedia.find({ postId: { $in: postIds }, isDeleted: false }).lean();

    const mediaMap = new Map<string, any[]>();
    allMedia.forEach(m => {
      const key = m.postId.toString();
      if (!mediaMap.has(key)) mediaMap.set(key, []);
      mediaMap.get(key)!.push(m);
    });

    const result = posts.map((s: any) => ({
      ...s.postId,
      media: mediaMap.get(s.postId._id.toString()) || [],
      isSaved: true,
      savedAt: s.createdAt,
    }));

    return {
      posts: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Share Post (increment count) ───────────────────
  readonly sharePost = async (req: Request) => {
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new HttpException(404, POST_MESSAGES.POST_NOT_FOUND);

    await Post.updateOne({ _id: postId }, { $inc: { shareCount: 1 } });

    return { shareCount: post.shareCount + 1 };
  };

  // ─── Get User Posts (profile posts) ─────────────────
  readonly getUserPosts = async (req: Request) => {
    const currentUserId = req.userTokenData._id;
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const postType = req.query.postType as string;

    const targetUserId = userId || currentUserId;
    const isSelf = targetUserId.toString() === currentUserId.toString();

    // If viewing own profile, show all posts. Otherwise, check follow status
    let visibilityFilter: any;
    if (isSelf) {
      visibilityFilter = {}; // all own posts
    } else {
      const isFollowing = await Follow.exists({ requesterId: currentUserId, receiverId: targetUserId, status: 'ACCEPTED' });
      visibilityFilter = isFollowing
        ? { visibility: { $in: ['PUBLIC', 'FRIENDS'] } }
        : { visibility: 'PUBLIC' };
    }

    const filter: any = {
      userId: targetUserId,
      isDeleted: false,
      ...visibilityFilter,
    };

    if (postType) filter.postType = postType;

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('userId', 'firstName lastName profileImage')
      .populate('taggedUsers', 'firstName lastName profileImage')
      .lean();

    const postIds = posts.map(p => p._id);
    const [allMedia, userLikes, userSaves] = await Promise.all([
      PostMedia.find({ postId: { $in: postIds }, isDeleted: false }).lean(),
      PostLike.find({ postId: { $in: postIds }, userId: currentUserId }).select('postId').lean(),
      PostSaved.find({ postId: { $in: postIds }, userId: currentUserId }).select('postId').lean(),
    ]);

    const mediaMap = new Map<string, any[]>();
    allMedia.forEach(m => {
      const key = m.postId.toString();
      if (!mediaMap.has(key)) mediaMap.set(key, []);
      mediaMap.get(key)!.push(m);
    });

    const likedSet = new Set(userLikes.map(l => l.postId.toString()));
    const savedSet = new Set(userSaves.map(s => s.postId.toString()));

    const result = posts.map(post => ({
      ...post,
      media: mediaMap.get(post._id.toString()) || [],
      isLiked: likedSet.has(post._id.toString()),
      isSaved: savedSet.has(post._id.toString()),
    }));

    return {
      posts: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };
}
