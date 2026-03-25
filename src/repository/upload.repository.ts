import { uploadToS3 } from '@/utils/s3.util';

export default class UploadRepo {
  readonly uploadImage = async (req: any) => {
    if (!req.file) {
      throw new Error('File is required');
    }

    const imageUrl = await uploadToS3({
      fileBuffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      folder: 'user-docs',
    });

    return { imageUrl };
  };
}
