import { Routes } from '@/interfaces/routes.interface';
import { Router } from 'express';
import { userAuthMiddleware } from '@/middlewares/userAuth.middleware';
import UploadRepo from '@/repository/upload.repository';
import { UploadController } from '@/controllers/upload.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { uploadImageSchema } from '@/validationSchema/upload.validation.schema';
import multer from 'multer';

class UploadRoute implements Routes {
  public userPath = '/upload';
  public router = Router();
  public uploadController = new UploadController(new UploadRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Multer config (memory storage for S3)
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    });

    this.router.post(
      `${this.userPath}/image`,
      userAuthMiddleware(),
      upload.single('file'), // 👈 frontend must send key as "file"
      validationMiddleware(uploadImageSchema, 'body'),
      this.uploadController.uploadImage,
    );
  }
}

export default UploadRoute;
