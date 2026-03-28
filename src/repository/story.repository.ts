import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { POST_MESSAGES } from '@/messages/post.messages';
import Story from '@/models/mongoose/story.model';
import StoryView from '@/models/mongoose/storyView.model';
import Follow from '@/models/mongoose/follow.model';
import { sendNotification } from '@/helper/pushNotification.helper';
import BlockRepo from '@/repository/block.repository';

export default class StoryRepo {
  constructor() {}

  // ─── Create Story ───────────────────────────────────
  readonly createStory = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { mediaType, mediaUrl, thumbnailUrl } = req.body;

    // Stories expire in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await Story.create({
      userId,
      mediaType,
      mediaUrl,
      thumbnailUrl: thumbnailUrl || null,
      expiresAt,
    });

    return story;
  };

  // ─── Delete Story ───────────────────────────────────
  readonly deleteStory = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { storyId } = req.params;

    const story = await Story.findOne({ _id: storyId, isDeleted: false });
    if (!story) throw new HttpException(404, POST_MESSAGES.STORY_NOT_FOUND);
    if (story.userId.toString() !== userId.toString()) {
      throw new HttpException(403, POST_MESSAGES.STORY_UNAUTHORIZED);
    }

    story.isDeleted = true;
    await story.save();

    return { storyId };
  };

  // ─── Get Stories Feed ───────────────────────────────
  // Returns stories grouped by user: own stories first, then followed users
  readonly getStoriesFeed = async (req: Request) => {
    const userId = req.userTokenData._id;

    // Get followed users + blocked users
    const [following, blockedIds] = await Promise.all([
      Follow.find({ requesterId: userId, status: 'ACCEPTED' }).select('receiverId').lean(),
      BlockRepo.getBlockedIds(userId),
    ]);
    const followingIds = following.map(f => f.receiverId);

    const now = new Date();

    // Get active (non-expired, non-deleted) stories from self + followed users, exclude blocked
    const stories = await Story.find({
      userId: { $in: [userId, ...followingIds], $nin: blockedIds },
      isDeleted: false,
      expiresAt: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    // Get which stories the current user has viewed
    const storyIds = stories.map(s => s._id);
    const views = await StoryView.find({ storyId: { $in: storyIds }, userId }).select('storyId').lean();
    const viewedSet = new Set(views.map(v => v.storyId.toString()));

    // Group stories by user
    const userStoryMap = new Map<string, any>();

    stories.forEach(story => {
      const uid = (story.userId as any)._id.toString();
      if (!userStoryMap.has(uid)) {
        userStoryMap.set(uid, {
          user: story.userId,
          stories: [],
          hasUnviewed: false,
        });
      }
      const group = userStoryMap.get(uid)!;
      const isViewed = viewedSet.has(story._id.toString());
      group.stories.push({ ...story, isViewed });
      if (!isViewed) group.hasUnviewed = true;
    });

    // Own stories first, then sorted by hasUnviewed (unviewed first)
    const grouped = Array.from(userStoryMap.values());
    const own = grouped.filter(g => (g.user as any)._id.toString() === userId.toString());
    const others = grouped
      .filter(g => (g.user as any)._id.toString() !== userId.toString())
      .sort((a, b) => (b.hasUnviewed ? 1 : 0) - (a.hasUnviewed ? 1 : 0));

    return [...own, ...others];
  };

  // ─── View Story ─────────────────────────────────────
  readonly viewStory = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { storyId } = req.params;

    const story = await Story.findOne({ _id: storyId, isDeleted: false, expiresAt: { $gt: new Date() } });
    if (!story) throw new HttpException(404, POST_MESSAGES.STORY_NOT_FOUND);

    // Upsert view (ignore duplicate)
    await StoryView.updateOne(
      { storyId, userId },
      { storyId, userId },
      { upsert: true }
    );

    // Notify story owner (if not self)
    if (story.userId.toString() !== userId.toString()) {
      await sendNotification({
        senderId: userId,
        receiverId: story.userId,
        type: 'STORY_VIEW',
        referenceId: story._id,
        title: 'Story Viewed',
        message: 'viewed your story',
      });
    }

    return { viewed: true };
  };

  // ─── Get Story Views ───────────────────────────────
  readonly getStoryViews = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { storyId } = req.params;

    const story = await Story.findOne({ _id: storyId, isDeleted: false });
    if (!story) throw new HttpException(404, POST_MESSAGES.STORY_NOT_FOUND);
    if (story.userId.toString() !== userId.toString()) {
      throw new HttpException(403, POST_MESSAGES.STORY_UNAUTHORIZED);
    }

    const views = await StoryView.find({ storyId })
      .populate('userId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return {
      views: views.map(v => v.userId),
      totalViews: views.length,
    };
  };
}
