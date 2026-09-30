import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { createPresignedUpload, deleteB2Object } from '../../config/b2.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
import { b2KeyFromPublicUrl, deleteMediaUrls } from '../../utils/mediaCleanup.js';
import { confirmUploadSchema, deleteByUrlSchema, presignSchema } from '../shared/schemas.js';
import { randomUUID } from 'node:crypto';

const router = Router();

router.post(
  '/presign',
  requireAuth,
  validateBody(presignSchema),
  asyncHandler(async (req, res) => {
    const { filename, contentType, folder } = req.body;
    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${randomUUID()}-${safeName}`;
    const result = await createPresignedUpload(key, contentType);
    res.json(ok(result));
  }),
);

router.post(
  '/confirm',
  requireAuth,
  validateBody(confirmUploadSchema),
  asyncHandler(async (req, res) => {
    const { key, publicUrl, contentType, folder } = req.body;
    const { data, error } = await getSupabase()
      .from('media_assets')
      .upsert(
        { key, public_url: publicUrl, content_type: contentType, folder },
        { onConflict: 'key' },
      )
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Upload confirmed'));
  }),
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { data, error } = await getSupabase()
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json(ok(data));
  }),
);

/** Delete a B2 object + media_assets row by public URL (used when replacing/clearing uploads). */
router.post(
  '/delete-by-url',
  requireAuth,
  validateBody(deleteByUrlSchema),
  asyncHandler(async (req, res) => {
    const url = String(req.body.url || '');
    const key = b2KeyFromPublicUrl(url);
    if (!key) {
      res.json(ok(null, 'No B2 object to delete'));
      return;
    }
    await deleteMediaUrls([url]);
    res.json(ok({ key }, 'Media deleted'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Asset not found', 404);

    try {
      await deleteB2Object(data.key);
    } catch (err) {
      console.error('[uploads] B2 delete failed', data.key, err);
    }

    const { error: delError } = await supabase.from('media_assets').delete().eq('id', req.params.id);
    if (delError) throw new AppError(delError.message, 500);
    res.json(ok(null, 'Asset deleted'));
  }),
);

export default router;
