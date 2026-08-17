import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import uuid4 from 'uuid4';
import path from 'path';
import 'dotenv/config';

const getDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

export const S3_RESOURCE_TYPES = [
  'profile',
  'exhibition',
  'exhibit-photo',
  'photo',
  'equipment',
  'editor',
  'attached-file',
] as const;

export type S3ResourceType = (typeof S3_RESOURCE_TYPES)[number];

export async function uploadImageToS3(
  buffer: Buffer,
  resourceType: S3ResourceType,
): Promise<string> {
  // AWS S3 설정
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const uuid = uuid4();

  // S3 업로드 설정
  const bucketName = process.env.S3_BUCKET_NAME;
  const key = `image/${resourceType}/${getDateString()}/${uuid}`; // 파일 이름
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read' as const,
  };

  // S3에 업로드
  const command = new PutObjectCommand(params);
  await s3.send(command);

  // 업로드된 파일 URL 반환
  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return fileUrl;
}

export async function uploadFileToS3(
  buffer: Buffer,
  originalFilename: string,
  resourceType: S3ResourceType,
  mimeType?: string,
): Promise<string> {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const uuid = uuid4();
  const bucketName = process.env.S3_BUCKET_NAME;
  const ext = path.extname(originalFilename);
  const key = `file/${resourceType}/${getDateString()}/${uuid}${ext}`;

  const asciiFallback = originalFilename.replace(/[^\x20-\x7E]/g, '_');
  const contentDisposition = `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(originalFilename)}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType || 'application/octet-stream',
    ContentDisposition: contentDisposition,
    ACL: 'public-read' as const,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return fileUrl;
}
