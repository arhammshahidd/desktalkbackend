import { env } from '../config/env.js';

/** Fields that should use stream=1 (images). Videos use redirect (no stream). */
export const IMAGE_MEDIA_FIELDS = new Set([
  'thumbnail_url',
  'host_photo_url',
  'guest_photo_url',
  'sponsor_logo_url',
  'cover_url',
  'photo_url',
  'logo_url',
]);

export const VIDEO_MEDIA_FIELDS = new Set(['video_url']);

/**
 * Build absolute private-media proxy URL.
 * Videos: /api/media?key=...  (302 → signed B2)
 * Images: /api/media?key=...&stream=1  (byte proxy)
 */
export function buildMediaProxyUrl(key: string, opts?: { stream?: boolean }) {
  const params = new URLSearchParams({ key });
  if (opts?.stream) params.set('stream', '1');
  return `${env.publicApiUrl.replace(/\/$/, '')}/api/media?${params.toString()}`;
}

/**
 * Resolve a stored value (raw B2 key, legacy public URL, or existing proxy URL)
 * into a B2 object key. Returns null if not B2 media.
 */
export function resolveMediaKey(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null;
  if (trimmed.startsWith('/figma/') || trimmed.startsWith('/icons')) return null;

  // Already a proxy URL: /api/media?key=... or absolute
  try {
    if (trimmed.includes('/api/media') && trimmed.includes('key=')) {
      const url = trimmed.startsWith('http')
        ? new URL(trimmed)
        : new URL(trimmed, env.publicApiUrl);
      const key = url.searchParams.get('key');
      return key ? decodeURIComponent(key) : null;
    }
  } catch {
    /* fall through */
  }

  // Legacy friendly / public B2 URL
  const publicBase = (env.b2.publicUrl || '').replace(/\/$/, '');
  if (publicBase && trimmed.startsWith(`${publicBase}/`)) {
    return decodeURIComponent(trimmed.slice(publicBase.length + 1).split('?')[0] || '') || null;
  }

  const bucket = env.b2.bucket;
  if (bucket) {
    const fileMarker = `/file/${bucket}/`;
    const idx = trimmed.indexOf(fileMarker);
    if (idx !== -1) {
      return decodeURIComponent(trimmed.slice(idx + fileMarker.length).split('?')[0] || '') || null;
    }
    // path-style signed/public: https://s3.../bucket/key
    const pathStyle = trimmed.match(
      new RegExp(`https?://[^/]+/${bucket.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(.+?)(?:\\?|$)`),
    );
    if (pathStyle?.[1]) {
      return decodeURIComponent(pathStyle[1]) || null;
    }
  }

  // Absolute non-B2 URL (external) — not our media
  if (/^https?:\/\//i.test(trimmed)) return null;

  // Raw object key e.g. podcasts/uuid-file.jpg
  if (trimmed.includes('..') || trimmed.length > 1024) return null;
  return trimmed.replace(/^\/+/, '');
}

/** Convert a DB media field value into a client-facing proxy URL (or leave external URLs alone). */
export function toClientMediaUrl(
  value: string | null | undefined,
  opts?: { stream?: boolean },
): string {
  if (!value) return '';
  const key = resolveMediaKey(value);
  if (!key) {
    // External / static path — return as-is
    return value;
  }
  return buildMediaProxyUrl(key, opts);
}

/** Map media columns on a row to proxy URLs for API responses. */
export function mapRowMediaUrls<T extends Record<string, unknown>>(
  row: T | null | undefined,
  fields: readonly string[],
): T | null | undefined {
  if (!row) return row;
  const next: Record<string, unknown> = { ...row };
  for (const field of fields) {
    if (!(field in next)) continue;
    const raw = next[field];
    if (typeof raw !== 'string' || !raw) continue;
    const stream = IMAGE_MEDIA_FIELDS.has(field) || (!VIDEO_MEDIA_FIELDS.has(field) && true);
    // Videos: no stream. Images: stream=1.
    const useStream = VIDEO_MEDIA_FIELDS.has(field) ? false : stream;
    next[field] = toClientMediaUrl(raw, { stream: useStream });
  }
  return next as T;
}

export function mapRowsMediaUrls<T extends Record<string, unknown>>(
  rows: T[] | null | undefined,
  fields: readonly string[],
): T[] {
  return (rows ?? []).map((row) => mapRowMediaUrls(row, fields) as T);
}

/** Persist B2 object keys in DB (strip proxy URLs / legacy public URLs). Keep external http(s) as-is. */
export function normalizeMediaInput(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const key = resolveMediaKey(trimmed);
  if (key) return key;
  return trimmed;
}

export function normalizeRowMediaInputs<T extends Record<string, unknown>>(
  row: T,
  fields: readonly string[],
): T {
  const next: Record<string, unknown> = { ...row };
  for (const field of fields) {
    if (field in next) {
      next[field] = normalizeMediaInput(next[field]);
    }
  }
  return next as T;
}
