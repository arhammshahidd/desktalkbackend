import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
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
    const { data, error } = await getSupabase()
      .from('team_members')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data, 'Team member updated'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await getSupabase().from('team_members').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    res.json(ok(null, 'Team member deleted'));
  }),
);

export default router;
