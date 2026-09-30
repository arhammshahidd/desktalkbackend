import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Required on Vercel so express-rate-limit sees the real client IP
app.set('trust proxy', 1);

app.use(
  helmet({
    // Allow <img>/<video> on the Cloudflare frontend to load /api/media from Vercel
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const allowedOrigins = new Set(
  [
    ...env.frontendUrls,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser / same-origin requests (no Origin header)
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Desktalk API is healthy',
    data: { env: env.nodeEnv, time: new Date().toISOString() },
  });
});

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions, try again later.' },
});
app.use('/api/submissions', formLimiter);

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
