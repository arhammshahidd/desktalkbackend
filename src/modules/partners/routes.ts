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
import {
  mapRowMediaUrls,
  mapRowsMediaUrls,
  normalizeRowMediaInputs,
} from '../../utils/mediaUrls.js';
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
    res.json(ok(mapRowsMediaUrls(data ?? [], PARTNER_MEDIA_FIELDS)));
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(partnerSchema),
  asyncHandler(async (req, res) => {
    const body = normalizeRowMediaInputs({ ...req.body }, PARTNER_MEDIA_FIELDS);
    const { data, error } = await getSupabase().from('partners').insert(body).select('*').single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(mapRowMediaUrls(data, PARTNER_MEDIA_FIELDS), 'Partner created'));
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

    const body = normalizeRowMediaInputs({ ...req.body }, PARTNER_MEDIA_FIELDS);
    const { data, error } = await supabase
      .from('partners')
      .update(body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);

    await deleteReplacedMedia(existing, body, PARTNER_MEDIA_FIELDS);
    res.json(ok(mapRowMediaUrls(data, PARTNER_MEDIA_FIELDS), 'Partner updated'));
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
