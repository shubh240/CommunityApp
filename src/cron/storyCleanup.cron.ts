import Story from '@/models/mongoose/story.model';
import StoryView from '@/models/mongoose/storyView.model';
import { logger } from '@/utils/logger';

// Story cleanup logic — called via API endpoint (triggered by AWS CloudWatch/EventBridge)
export const storyCleanup = async () => {
  const now = new Date();

  const expiredStories = await Story.find({
    expiresAt: { $lte: now },
    isDeleted: false,
  }).select('_id');

  if (expiredStories.length === 0) {
    return { deletedStories: 0, deletedViews: 0 };
  }

  const storyIds = expiredStories.map(s => s._id);

  const [storyResult, viewResult] = await Promise.all([
    Story.updateMany({ _id: { $in: storyIds } }, { isDeleted: true }),
    StoryView.deleteMany({ storyId: { $in: storyIds } }),
  ]);

  logger.info(
    `[Story Cleanup] Deleted ${storyResult.modifiedCount} expired stories, ${viewResult.deletedCount} story views`
  );

  return {
    deletedStories: storyResult.modifiedCount,
    deletedViews: viewResult.deletedCount,
  };
};
