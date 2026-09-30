import { deleteB2Object } from '../config/b2.js';
import { getSupabase } from '../config/supabase.js';
import { resolveMediaKey } from './mediaUrls.js';

/** Media URL columns on content tables. */
export const PODCAST_MEDIA_FIELDS = [
  'thumbnail_url',
  'video_url',
  'host_photo_url',
  'guest_photo_url',
  'sponsor_logo_url',
] as const;

export const BLOG_MEDIA_FIELDS = ['cover_url', 'author_photo_url'] as const;
export const TEAM_MEDIA_FIELDS = ['photo_url'] as const;
export const PARTNER_MEDIA_FIELDS = ['logo_url'] as const;

/** @deprecated use resolveMediaKey — kept for older call sites */
export function b2KeyFromPublicUrl(url: string | null | undefined): string | null {
  return resolveMediaKey(url);
}

function collectValues(
  row: Record<string, unknown> | null | undefined,
  fields: readonly string[],
): string[] {
  if (!row) return [];
  return fields
    .map((field) => row[field])
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
}

/** Delete B2 objects + matching media_assets rows for keys / proxy URLs / legacy URLs. */
export async function deleteMediaUrls(values: Array<string | null | undefined>) {
  const keys = [
    ...new Set(
      values
        .map((value) => resolveMediaKey(value))
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

export async function deleteMediaFromRow(
  row: Record<string, unknown> | null | undefined,
  fields: readonly string[],
) {
  await deleteMediaUrls(collectValues(row, fields));
}

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
      const oldKey = resolveMediaKey(oldUrl);
      const newKey = typeof newUrl === 'string' ? resolveMediaKey(newUrl) : null;
      // Only delete if the underlying object key actually changed
      if (oldKey && oldKey !== newKey) {
        toDelete.push(oldUrl);
      }
    }
  }

  await deleteMediaUrls(toDelete);
}
