import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import { storyCleanup } from '@/cron/storyCleanup.cron';

export class CronController {
  readonly runStoryCleanup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await storyCleanup();
      return generalResponse(res, result, 'Story cleanup completed', 'success');
    } catch (error) {
      next(error);
    }
  };
}
