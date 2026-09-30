import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { env } from './env.js';
import { AppError } from '../middleware/errorHandler.js';

let s3: S3Client | null = null;

export function getB2Client(): S3Client {
  if (!s3) {
    if (!env.b2.keyId || !env.b2.applicationKey || !env.b2.endpoint || !env.b2.bucket) {
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

/** Reject path traversal / absolute URLs; return a clean object key. */
export function sanitizeMediaKey(raw: string): string {
  let key = String(raw || '').trim();
  try {
    key = decodeURIComponent(key);
  } catch {
    /* keep raw */
  }
  key = key.replace(/^\/+/, '').replace(/\\/g, '/');

  if (!key || key.length > 1024) {
    throw new AppError('Invalid media key', 400);
  }
  if (
    key.includes('..') ||
    key.startsWith('http://') ||
    key.startsWith('https://') ||
    key.includes('\0')
  ) {
    throw new AppError('Invalid media key', 400);
  }
  return key;
}

export async function createPresignedUpload(key: string, contentType: string, expiresIn = 900) {
  const safeKey = sanitizeMediaKey(key);
  const client = getB2Client();
  const command = new PutObjectCommand({
    Bucket: env.b2.bucket,
    Key: safeKey,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  return { uploadUrl, key: safeKey };
}

/** Short-lived signed GET URL for private B2 objects (used by 302 media proxy). */
export async function createPresignedDownload(key: string, expiresIn = 3600) {
  const safeKey = sanitizeMediaKey(key);
  const client = getB2Client();
  const command = new GetObjectCommand({
    Bucket: env.b2.bucket,
    Key: safeKey,
  });
  return getSignedUrl(client, command, { expiresIn });
}

/** Stream object bytes from B2 (supports HTTP Range for seeking when needed). */
export async function getB2Object(
  key: string,
  range?: string,
): Promise<GetObjectCommandOutput> {
  const safeKey = sanitizeMediaKey(key);
  const client = getB2Client();
  return client.send(
    new GetObjectCommand({
      Bucket: env.b2.bucket,
      Key: safeKey,
      ...(range ? { Range: range } : {}),
    }),
  );
}

export async function deleteB2Object(key: string) {
  const safeKey = sanitizeMediaKey(key);
  const client = getB2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.b2.bucket,
      Key: safeKey,
    }),
  );
}
