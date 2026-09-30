import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok, slugify } from '../../utils/helpers.js';
import {
  deleteMediaFromRow,
  deleteReplacedMedia,
  PODCAST_MEDIA_FIELDS,
} from '../../utils/mediaCleanup.js';
import {
  mapRowMediaUrls,
  mapRowsMediaUrls,
  normalizeRowMediaInputs,
} from '../../utils/mediaUrls.js';
import { podcastSchema } from '../shared/schemas.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await getSupabase()
      .from('podcasts')
      .select('*, category:categories(*)')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('published_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json(ok(mapRowsMediaUrls(data ?? [], PODCAST_MEDIA_FIELDS)));
  }),
);

router.get(
  '/admin/all',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { data, error } = await getSupabase()
      .from('podcasts')
      .select('*, category:categories(*)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json(ok(mapRowsMediaUrls(data ?? [], PODCAST_MEDIA_FIELDS)));
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('podcasts')
      .select('*, category:categories(*)')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Podcast not found', 404);
    res.json(ok(mapRowMediaUrls(data, PODCAST_MEDIA_FIELDS)));
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(podcastSchema),
  asyncHandler(async (req, res) => {
    const body = normalizeRowMediaInputs({ ...req.body }, PODCAST_MEDIA_FIELDS);
    const slug = body.slug || slugify(body.title);
    const payload = {
      ...body,
      slug,
      published_at: body.published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await getSupabase().from('podcasts').insert(payload).select('*').single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(mapRowMediaUrls(data, PODCAST_MEDIA_FIELDS), 'Podcast created'));
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(podcastSchema.partial()),
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const { data: existing, error: findError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (findError) throw new AppError(findError.message, 500);
    if (!existing) throw new AppError('Podcast not found', 404);

    const body = normalizeRowMediaInputs(
      { ...req.body, updated_at: new Date().toISOString() },
      PODCAST_MEDIA_FIELDS,
    );
    if (body.title && !body.slug) body.slug = slugify(body.title);
    if (body.published === true) body.published_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('podcasts')
      .update(body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);

    await deleteReplacedMedia(existing, body, PODCAST_MEDIA_FIELDS);
    res.json(ok(mapRowMediaUrls(data, PODCAST_MEDIA_FIELDS), 'Podcast updated'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Podcast not found', 404);

    await deleteMediaFromRow(data, PODCAST_MEDIA_FIELDS);
    res.json(ok(null, 'Podcast deleted'));
  }),
);

export default router;
