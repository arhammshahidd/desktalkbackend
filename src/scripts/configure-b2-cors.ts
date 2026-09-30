import { PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { getB2Client } from '../config/b2.js';

async function main() {
  const origins = [
    ...env.frontendUrls,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  const client = getB2Client();
  await client.send(
    new PutBucketCorsCommand({
      Bucket: env.b2.bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: origins,
            AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag', 'Content-Type', 'x-amz-request-id'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );

  console.log('B2 CORS configured for origins:', origins.join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
