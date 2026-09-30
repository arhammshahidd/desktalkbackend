import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok, slugify } from '../../utils/helpers.js';
import {
  BLOG_MEDIA_FIELDS,
  deleteMediaFromRow,
  deleteReplacedMedia,
} from '../../utils/mediaCleanup.js';
import {
  mapRowMediaUrls,
  mapRowsMediaUrls,
  normalizeRowMediaInputs,
} from '../../utils/mediaUrls.js';
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
    res.json(ok(mapRowsMediaUrls(data ?? [], BLOG_MEDIA_FIELDS)));
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
    res.json(ok(mapRowsMediaUrls(data ?? [], BLOG_MEDIA_FIELDS)));
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
    res.json(ok(mapRowMediaUrls(data, BLOG_MEDIA_FIELDS)));
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(blogSchema),
  asyncHandler(async (req, res) => {
    const body = normalizeRowMediaInputs({ ...req.body }, BLOG_MEDIA_FIELDS);
    const payload = {
      ...body,
      slug: body.slug || slugify(body.title),
      published_at: body.published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await getSupabase().from('blogs').insert(payload).select('*').single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(mapRowMediaUrls(data, BLOG_MEDIA_FIELDS), 'Blog created'));
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(blogSchema.partial()),
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const { data: existing, error: findError } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (findError) throw new AppError(findError.message, 500);
    if (!existing) throw new AppError('Blog not found', 404);

    const body = normalizeRowMediaInputs(
      { ...req.body, updated_at: new Date().toISOString() },
      BLOG_MEDIA_FIELDS,
    );
    if (body.title && !body.slug) body.slug = slugify(body.title);
    if (body.published === true) body.published_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('blogs')
      .update(body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);

    await deleteReplacedMedia(existing, body, BLOG_MEDIA_FIELDS);
    res.json(ok(mapRowMediaUrls(data, BLOG_MEDIA_FIELDS), 'Blog updated'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Blog not found', 404);

    await deleteMediaFromRow(data, BLOG_MEDIA_FIELDS);
    res.json(ok(null, 'Blog deleted'));
  }),
);

export default router;
