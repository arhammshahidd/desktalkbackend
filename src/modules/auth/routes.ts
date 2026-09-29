import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { loginSchema } from './schema.js';
import * as controller from './controller.js';

const router = Router();

router.post('/login', validateBody(loginSchema), asyncHandler(controller.login));
router.get('/me', requireAuth, asyncHandler(controller.me));

export default router;
