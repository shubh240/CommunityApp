import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { CronController } from '@/controllers/cron.controller';
import { CRON_SECRET } from '@/config';

class CronRoute implements Routes {
  public path = '/cron';
  public router = Router();
  public cronController = new CronController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // AWS CloudWatch/EventBridge hits these endpoints on schedule
    // Protected by a secret key in headers (not user auth)
    this.router.post(
      `${this.path}/story-cleanup`,
      this.verifySecret,
      this.cronController.runStoryCleanup,
    );
  }

  // Simple secret-based auth for cron endpoints
  // AWS CloudWatch sends this header when triggering the endpoint
  private verifySecret = (req: any, res: any, next: any) => {
    const secret = req.headers['x-cron-secret'];
    if (!CRON_SECRET || secret !== CRON_SECRET) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };
}

export default CronRoute;
