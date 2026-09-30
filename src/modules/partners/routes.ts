import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
import {
  deleteMediaFromRow,
  deleteReplacedMedia,
  PARTNER_MEDIA_FIELDS,
} from '../../utils/mediaCleanup.js';
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
    const supabase = getSupabase();
    const { data: existing, error: findError } = await supabase
      .from('partners')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (findError) throw new AppError(findError.message, 500);
    if (!existing) throw new AppError('Partner not found', 404);

    const { data, error } = await supabase
      .from('partners')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);

    await deleteReplacedMedia(existing, req.body, PARTNER_MEDIA_FIELDS);
    res.json(ok(data, 'Partner updated'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('partners')
      .delete()
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Partner not found', 404);

    await deleteMediaFromRow(data, PARTNER_MEDIA_FIELDS);
    res.json(ok(null, 'Partner deleted'));
  }),
);

export default router;
