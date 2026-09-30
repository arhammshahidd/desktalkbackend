import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
import {
  deleteMediaFromRow,
  deleteReplacedMedia,
  TEAM_MEDIA_FIELDS,
} from '../../utils/mediaCleanup.js';
import { teamSchema } from '../shared/schemas.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await getSupabase()
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data));
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(teamSchema),
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('team_members')
      .insert({ ...req.body, updated_at: new Date().toISOString() })
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Team member created'));
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(teamSchema.partial()),
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const { data: existing, error: findError } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (findError) throw new AppError(findError.message, 500);
    if (!existing) throw new AppError('Team member not found', 404);

    const body = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('team_members')
      .update(body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);

    await deleteReplacedMedia(existing, body, TEAM_MEDIA_FIELDS);
    res.json(ok(data, 'Team member updated'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Team member not found', 404);

    await deleteMediaFromRow(data, TEAM_MEDIA_FIELDS);
    res.json(ok(null, 'Team member deleted'));
  }),
);

export default router;
