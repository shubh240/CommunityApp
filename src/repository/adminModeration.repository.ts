import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { ADMIN_MESSAGES } from '@/messages/admin.messages';
import Post from '@/models/mongoose/post.model';
import PostMedia from '@/models/mongoose/postMedia.model';
import Story from '@/models/mongoose/story.model';
import StoryView from '@/models/mongoose/storyView.model';
import ChatRoom from '@/models/mongoose/chatRoom.model';
import MatrimonialProfile from '@/models/mongoose/matrimonialProfile.model';

export default class AdminModerationRepo {
  constructor() {}

  // ═══════════════════════════════════════════════════
  //  POSTS MODERATION
  // ═══════════════════════════════════════════════════

  readonly listPosts = async (req: Request) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const { postType, visibility, userId, q } = req.query;

    const filter: any = { isDeleted: false };
    if (postType) filter.postType = postType;
    if (visibility) filter.visibility = visibility;
    if (userId) filter.userId = userId;
    if (q) filter.content = { $regex: q, $options: 'i' };

    const skip = (page - 1) * pageSize;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('userId', 'firstName lastName profileImage')
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Attach media
    const postIds = posts.map(p => p._id);
    const allMedia = await PostMedia.find({ postId: { $in: postIds }, isDeleted: false }).lean();
    const mediaMap = new Map<string, any[]>();
    allMedia.forEach(m => {
      const key = m.postId.toString();
      if (!mediaMap.has(key)) mediaMap.set(key, []);
      mediaMap.get(key)!.push(m);
    });

    const result = posts.map(p => ({
      ...p,
      media: mediaMap.get(p._id.toString()) || [],
    }));

    return {
      posts: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  readonly deletePost = async (req: Request) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) throw new HttpException(404, ADMIN_MESSAGES.POST_NOT_FOUND);

    post.isDeleted = true;
    await post.save();
    await PostMedia.updateMany({ postId }, { isDeleted: true });

    return { deleted: true };
  };

  // ═══════════════════════════════════════════════════
  //  STORIES MODERATION
  // ═══════════════════════════════════════════════════

  readonly listStories = async (req: Request) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const { userId } = req.query;

    const filter: any = { isDeleted: false, expiresAt: { $gt: new Date() } };
    if (userId) filter.userId = userId;

    const skip = (page - 1) * pageSize;

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('userId', 'firstName lastName profileImage')
        .lean(),
      Story.countDocuments(filter),
    ]);

    return {
      stories,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  readonly deleteStory = async (req: Request) => {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) throw new HttpException(404, ADMIN_MESSAGES.STORY_NOT_FOUND);

    story.isDeleted = true;
    await story.save();
    await StoryView.deleteMany({ storyId });

    return { deleted: true };
  };

  // ═══════════════════════════════════════════════════
  //  GROUPS MODERATION
  // ═══════════════════════════════════════════════════

  readonly listGroups = async (req: Request) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const { groupType, q } = req.query;

    const filter: any = { type: 'GROUP', isActive: true };
    if (groupType) filter.groupType = groupType;
    if (q) filter.name = { $regex: q, $options: 'i' };

    const skip = (page - 1) * pageSize;

    const [groups, total] = await Promise.all([
      ChatRoom.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('ownerId', 'firstName lastName profileImage')
        .lean(),
      ChatRoom.countDocuments(filter),
    ]);

    const result = groups.map(g => ({
      ...g,
      memberCount: g.participants.length,
    }));

    return {
      groups: result,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  readonly getGroup = async (req: Request) => {
    const { groupId } = req.params;

    const group = await ChatRoom.findOne({ _id: groupId, type: 'GROUP' })
      .populate('ownerId', 'firstName lastName profileImage')
      .populate('participants', 'firstName lastName profileImage')
      .populate('adminIds', 'firstName lastName profileImage')
      .populate('moderatorIds', 'firstName lastName profileImage')
      .populate('bannedMemberIds', 'firstName lastName profileImage')
      .lean();

    if (!group) throw new HttpException(404, ADMIN_MESSAGES.GROUP_NOT_FOUND);

    return group;
  };

  readonly deleteGroup = async (req: Request) => {
    const { groupId } = req.params;

    const group = await ChatRoom.findOne({ _id: groupId, type: 'GROUP' });
    if (!group) throw new HttpException(404, ADMIN_MESSAGES.GROUP_NOT_FOUND);

    group.isActive = false;
    await group.save();

    return { deleted: true };
  };

  // ═══════════════════════════════════════════════════
  //  MATRIMONIAL (single profile detail)
  // ═══════════════════════════════════════════════════

  readonly getMatrimonialProfile = async (req: Request) => {
    const { profileId } = req.params;

    const profile = await MatrimonialProfile.findById(profileId)
      .populate('userId', 'firstName lastName mobile email profileImage')
      .populate('createdForUserId', 'firstName lastName relation')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!profile) throw new HttpException(404, 'Matrimonial profile not found');

    return profile;
  };
}
