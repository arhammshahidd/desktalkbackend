import { Router } from 'express';
import { Readable } from 'node:stream';
import { createPresignedDownload, getB2Object, sanitizeMediaKey } from '../../config/b2.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';

const router = Router();

/**
 * Private B2 media proxy.
 *
 * GET /api/media?key=podcasts/file.mp4
 *   → 302 to short-lived signed B2 URL (best for <video> + Range seeking)
 *
 * GET /api/media?key=podcasts/cover.jpg&stream=1
 *   → streams bytes through the API (best for <img> / same-origin / edge cache)
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rawKey = String(req.query.key || '');
    if (!rawKey) throw new AppError('Missing key', 400);

    let key: string;
    try {
      key = sanitizeMediaKey(rawKey);
    } catch {
      throw new AppError('Invalid media key', 400);
    }

    const stream = String(req.query.stream || '') === '1';

    // Allow embedding from the frontend origin
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');

    if (!stream) {
      const signedUrl = await createPresignedDownload(key, 3600);
      res.setHeader('Cache-Control', 'private, max-age=300');
      res.redirect(302, signedUrl);
      return;
    }

    const range = typeof req.headers.range === 'string' ? req.headers.range : undefined;

    try {
      const obj = await getB2Object(key, range);
      const status = range && obj.ContentRange ? 206 : 200;
      res.status(status);
      res.setHeader('Content-Type', obj.ContentType || 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
      if (obj.ContentLength != null) {
        res.setHeader('Content-Length', String(obj.ContentLength));
      }
      if (obj.ContentRange) {
        res.setHeader('Content-Range', obj.ContentRange);
      }
      if (obj.ETag) {
        res.setHeader('ETag', obj.ETag);
      }

      const body = obj.Body;
      if (!body) {
        res.end();
        return;
      }

      if (body instanceof Readable) {
        body.pipe(res);
        return;
      }

      // Web/ReadableStream-like body (SDK variants)
      if (typeof (body as { transformToByteArray?: () => Promise<Uint8Array> }).transformToByteArray === 'function') {
        const bytes = await (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
        res.send(Buffer.from(bytes));
        return;
      }

      res.end();
    } catch (err) {
      console.error('[media] stream failed', key, err);
      throw new AppError('Media not found', 404);
    }
  }),
);

export default router;
