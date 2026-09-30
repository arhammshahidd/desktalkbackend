import { deleteB2Object } from '../config/b2.js';
import { env } from '../config/env.js';
import { getSupabase } from '../config/supabase.js';

/** Media URL columns on content tables. */
export const PODCAST_MEDIA_FIELDS = [
  'thumbnail_url',
  'video_url',
  'host_photo_url',
  'guest_photo_url',
  'sponsor_logo_url',
] as const;

export const BLOG_MEDIA_FIELDS = ['cover_url'] as const;
export const TEAM_MEDIA_FIELDS = ['photo_url'] as const;
export const PARTNER_MEDIA_FIELDS = ['logo_url'] as const;

/**
 * Derive a B2 object key from a public URL produced by createPresignedUpload.
 * Supports friendly URLs like https://f000.backblazeb2.com/file/{bucket}/{key}
 * and any URL that starts with B2_PUBLIC_URL.
 */
export function b2KeyFromPublicUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null;

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
  }

  return null;
}

function collectUrls(
  row: Record<string, unknown> | null | undefined,
  fields: readonly string[],
): string[] {
  if (!row) return [];
  return fields
    .map((field) => row[field])
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
}

/** Delete B2 objects + matching media_assets rows for the given public URLs. */
export async function deleteMediaUrls(urls: Array<string | null | undefined>) {
  const keys = [
    ...new Set(
      urls
        .map((url) => b2KeyFromPublicUrl(url))
        .filter((key): key is string => Boolean(key)),
    ),
  ];

  if (!keys.length) return;

  const supabase = getSupabase();

  for (const key of keys) {
    try {
      await deleteB2Object(key);
    } catch (err) {
      console.error('[media] B2 delete failed for', key, err);
    }

    const { error } = await supabase.from('media_assets').delete().eq('key', key);
    if (error) {
      console.error('[media] media_assets delete failed for', key, error.message);
    }
  }
}

/** Delete media referenced by selected columns on a row. */
export async function deleteMediaFromRow(
  row: Record<string, unknown> | null | undefined,
  fields: readonly string[],
) {
  await deleteMediaUrls(collectUrls(row, fields));
}

/**
 * After an update, remove B2 files for fields whose URL changed or was cleared.
 */
export async function deleteReplacedMedia(
  previous: Record<string, unknown> | null | undefined,
  next: Record<string, unknown>,
  fields: readonly string[],
) {
  if (!previous) return;

  const toDelete: string[] = [];
  for (const field of fields) {
    if (!(field in next)) continue;
    const oldUrl = previous[field];
    const newUrl = next[field];
    if (typeof oldUrl === 'string' && oldUrl && oldUrl !== newUrl) {
      toDelete.push(oldUrl);
    }
  }

  await deleteMediaUrls(toDelete);
}
