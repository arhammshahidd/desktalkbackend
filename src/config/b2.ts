import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env.js';

let s3: S3Client | null = null;

export function getB2Client(): S3Client {
  if (!s3) {
    if (!env.b2.keyId || !env.b2.applicationKey || !env.b2.endpoint) {
      throw new Error('Backblaze B2 is not configured. Set B2_* environment variables.');
    }
    s3 = new S3Client({
      region: env.b2.region,
      endpoint: env.b2.endpoint,
      credentials: {
        accessKeyId: env.b2.keyId,
        secretAccessKey: env.b2.applicationKey,
      },
      forcePathStyle: true,
    });
  }
  return s3;
}

export async function createPresignedUpload(key: string, contentType: string, expiresIn = 900) {
  const client = getB2Client();
  const command = new PutObjectCommand({
    Bucket: env.b2.bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = `${env.b2.publicUrl.replace(/\/$/, '')}/${key}`;
  return { uploadUrl, publicUrl, key };
}

export async function deleteB2Object(key: string) {
  const client = getB2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.b2.bucket,
      Key: key,
    }),
  );
}
