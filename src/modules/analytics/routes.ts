import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
import { trackViewSchema } from './schema.js';
import { getAnalyticsOverview, trackView } from './service.js';

const router = Router();

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many analytics events.' },
});

router.post(
  '/track',
  trackLimiter,
  validateBody(trackViewSchema),
  asyncHandler(async (req, res) => {
    const result = await trackView(req.body, String(req.headers['user-agent'] || ''));
    res.status(202).json(ok(result, 'Tracked'));
  }),
);

router.get(
  '/overview',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const data = await getAnalyticsOverview();
    res.json(ok(data));
  }),
);

export default router;
