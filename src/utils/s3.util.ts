import AWS from 'aws-sdk';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

interface UploadParams {
  fileBuffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}

export const uploadToS3 = async ({
  fileBuffer,
  originalName,
  mimeType,
  folder = 'uploads',
}: UploadParams): Promise<string> => {
  const ext = path.extname(originalName);
  const key = `${folder}/${uuidv4()}${ext}`;

  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  const uploadResult = await s3.upload(params).promise();

  return uploadResult.Location; // public URL
};
