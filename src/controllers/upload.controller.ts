import { Request, Response, NextFunction } from 'express';
import UploadRepo from '@/repository/upload.repository';
import { generalResponse } from '@/helper/common.helper';

export class UploadController {
  constructor(private readonly uploadRepo = new UploadRepo()) {}

  readonly uploadImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.uploadRepo.uploadImage(req);
      return generalResponse(res, data, 'IMAGE_UPLOADED', 'success', false);
    } catch (err) {
      next(err);
    }
  };
}
