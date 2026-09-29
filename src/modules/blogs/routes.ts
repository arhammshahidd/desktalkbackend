import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok, slugify } from '../../utils/helpers.js';
import { blogSchema } from '../shared/schemas.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await getSupabase()
      .from('blogs')
      .select('*, category:categories(*)')
      .eq('published', true)
      .order('published_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data));
  }),
);

router.get(
  '/admin/all',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { data, error } = await getSupabase()
      .from('blogs')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data));
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('blogs')
      .select('*, category:categories(*)')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Blog not found', 404);
    res.json(ok(data));
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(blogSchema),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const payload = {
      ...body,
      slug: body.slug || slugify(body.title),
      published_at: body.published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await getSupabase().from('blogs').insert(payload).select('*').single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Blog created'));
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(blogSchema.partial()),
  asyncHandler(async (req, res) => {
    const body = { ...req.body, updated_at: new Date().toISOString() };
    if (body.title && !body.slug) body.slug = slugify(body.title);
    if (body.published === true) body.published_at = new Date().toISOString();
    const { data, error } = await getSupabase()
      .from('blogs')
      .update(body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data, 'Blog updated'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await getSupabase().from('blogs').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    res.json(ok(null, 'Blog deleted'));
  }),
);

export default router;
