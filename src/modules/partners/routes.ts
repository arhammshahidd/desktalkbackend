import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
import { partnerSchema } from '../shared/schemas.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await getSupabase()
      .from('partners')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data));
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(partnerSchema),
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase().from('partners').insert(req.body).select('*').single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Partner created'));
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(partnerSchema.partial()),
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('partners')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data, 'Partner updated'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await getSupabase().from('partners').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    res.json(ok(null, 'Partner deleted'));
  }),
);

export default router;
