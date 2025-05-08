import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

require("dotenv").config();

const getDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}

export async function uploadImageToS3(buffer: Buffer): Promise<string> {
  // AWS S3 설정
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

    // S3 업로드 설정
    const bucketName = process.env.S3_BUCKET_NAME;
    const key = `image/${getDateString()}/${Date.now()}`; // 파일 이름
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
      ACL: "public-read" as const,
    };
  
  // S3에 업로드
  const command = new PutObjectCommand(params);
  await s3.send(command);

  // 업로드된 파일 URL 반환
  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return fileUrl;
}
