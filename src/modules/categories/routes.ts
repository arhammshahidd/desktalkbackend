import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok, slugify } from '../../utils/helpers.js';
import { categorySchema } from '../shared/schemas.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    let query = getSupabase().from('categories').select('*').order('name');
    if (req.query.type) query = query.eq('type', String(req.query.type));
    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data));
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(categorySchema),
  asyncHandler(async (req, res) => {
    const payload = { ...req.body, slug: req.body.slug || slugify(req.body.name) };
    const { data, error } = await getSupabase().from('categories').insert(payload).select('*').single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Category created'));
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(categorySchema.partial()),
  asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (body.name && !body.slug) body.slug = slugify(body.name);
    const { data, error } = await getSupabase()
      .from('categories')
      .update(body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data, 'Category updated'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await getSupabase().from('categories').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    res.json(ok(null, 'Category deleted'));
  }),
);

export default router;
