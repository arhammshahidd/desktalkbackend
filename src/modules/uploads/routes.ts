import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { createPresignedUpload, deleteB2Object, sanitizeMediaKey } from '../../config/b2.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
import { deleteMediaUrls } from '../../utils/mediaCleanup.js';
import { buildMediaProxyUrl, resolveMediaKey } from '../../utils/mediaUrls.js';
import {
  confirmUploadSchema,
  deleteByUrlSchema,
  presignSchema,
} from '../shared/schemas.js';
import { randomUUID } from 'node:crypto';

const router = Router();

function isVideoContentType(contentType: string) {
  return contentType.toLowerCase().startsWith('video/');
}

router.post(
  '/presign',
  requireAuth,
  validateBody(presignSchema),
  asyncHandler(async (req, res) => {
    const { filename, contentType, folder } = req.body;
    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${randomUUID()}-${safeName}`;
    const { uploadUrl, key: safeKey } = await createPresignedUpload(key, contentType);
    const stream = !isVideoContentType(contentType);
    const mediaUrl = buildMediaProxyUrl(safeKey, { stream });
    res.json(
      ok({
        uploadUrl,
        key: safeKey,
        mediaUrl,
        /** @deprecated private bucket — use mediaUrl / key */
        publicUrl: mediaUrl,
      }),
    );
  }),
);

router.post(
  '/confirm',
  requireAuth,
  validateBody(confirmUploadSchema),
  asyncHandler(async (req, res) => {
    const { key, contentType, folder } = req.body;
    const safeKey = sanitizeMediaKey(key);
    const stream = !isVideoContentType(String(contentType || ''));
    const mediaUrl = buildMediaProxyUrl(safeKey, { stream });

    const { data, error } = await getSupabase()
      .from('media_assets')
      .upsert(
        {
          key: safeKey,
          public_url: mediaUrl,
          content_type: contentType,
          folder,
        },
        { onConflict: 'key' },
      )
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok({ ...data, mediaUrl, key: safeKey }, 'Upload confirmed'));
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

/** Delete B2 object by key or by proxy/legacy URL. */
router.post(
  '/delete-by-url',
  requireAuth,
  validateBody(deleteByUrlSchema),
  asyncHandler(async (req, res) => {
    const value = String(req.body.url || req.body.key || '');
    const key = resolveMediaKey(value);
    if (!key) {
      res.json(ok(null, 'No B2 object to delete'));
      return;
    }
    await deleteMediaUrls([key]);
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
