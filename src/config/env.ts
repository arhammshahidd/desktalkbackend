import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('7d'),
  B2_KEY_ID: z.string().min(1),
  B2_APPLICATION_KEY: z.string().min(1),
  B2_BUCKET: z.string().min(1),
  B2_REGION: z.string().default('us-west-004'),
  B2_ENDPOINT: z.string().url(),
  B2_PUBLIC_URL: z.string().url(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
const isProd = (process.env.NODE_ENV || 'development') === 'production';

if (!parsed.success) {
  console.warn(
    '[env] Missing or invalid environment variables. API will start but DB/media calls may fail.',
    parsed.error.flatten().fieldErrors,
  );
}

const jwtSecret = process.env.JWT_SECRET || '';
if (isProd && (!jwtSecret || jwtSecret === 'dev-secret-change-me')) {
  console.error('[env] JWT_SECRET must be set to a strong unique value in production.');
}

const frontendUrlRaw = process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrls = frontendUrlRaw
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  /** Primary frontend origin (first entry if comma-separated). */
  frontendUrl: frontendUrls[0] || 'http://localhost:5173',
  /** All allowed frontend origins (comma-separated FRONTEND_URL). */
  frontendUrls,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: jwtSecret || (isProd ? '' : 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  b2: {
    keyId: process.env.B2_KEY_ID || '',
    applicationKey: process.env.B2_APPLICATION_KEY || '',
    bucket: process.env.B2_BUCKET || '',
    region: process.env.B2_REGION || 'us-west-004',
    endpoint: process.env.B2_ENDPOINT || '',
    publicUrl: process.env.B2_PUBLIC_URL || '',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@desktalk.com',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
    name: process.env.ADMIN_NAME || 'Desktalk Admin',
  },
  isDev: !isProd,
};
