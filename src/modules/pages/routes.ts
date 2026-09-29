import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
import { pageSettingSchema } from '../shared/schemas.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { data, error } = await getSupabase().from('page_settings').select('*').order('key');
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data));
  }),
);

router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('page_settings')
      .select('*')
      .eq('key', req.params.key)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Setting not found', 404);
    res.json(ok(data));
  }),
);

router.put(
  '/:key',
  requireAuth,
  validateBody(pageSettingSchema),
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('page_settings')
      .upsert({
        key: req.params.key,
        value: req.body.value,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data, 'Setting saved'));
  }),
);

export default router;
