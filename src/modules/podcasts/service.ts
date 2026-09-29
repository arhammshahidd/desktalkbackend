import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { slugify } from '../../utils/helpers.js';
import type { PodcastBody, PodcastUpdate } from './schema.js';

const selectWithCategory =
  '*, categories(id, name, slug, type)';

function throwIfError(error: { message: string } | null) {
  if (error) throw new AppError(error.message, 500);
}

export async function listPublished() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('podcasts')
    .select(selectWithCategory)
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false });

  throwIfError(error);
  return (data ?? []).map(mapCategory);
}

export async function getBySlug(slug: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('podcasts')
    .select(selectWithCategory)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Podcast not found', 404);
  return mapCategory(data);
}

export async function listAll() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('podcasts')
    .select(selectWithCategory)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  throwIfError(error);
  return (data ?? []).map(mapCategory);
}

export async function create(input: PodcastBody) {
  const supabase = getSupabase();
  const slug = input.slug?.trim() || slugify(input.title);
  const published_at =
    input.published && !input.published_at ? new Date().toISOString() : input.published_at ?? null;

  const { data, error } = await supabase
    .from('podcasts')
    .insert({ ...input, slug, published_at, updated_at: new Date().toISOString() })
    .select(selectWithCategory)
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Slug already exists', 409);
    throw new AppError(error.message, 500);
  }
  return mapCategory(data);
}

export async function update(id: string, input: PodcastUpdate) {
  const supabase = getSupabase();
  const payload: Record<string, unknown> = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  if (input.title && !input.slug) {
    payload.slug = slugify(input.title);
  }
  if (input.published === true && input.published_at === undefined) {
    payload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('podcasts')
    .update(payload)
    .eq('id', id)
    .select(selectWithCategory)
    .maybeSingle();

  if (error) {
    if (error.code === '23505') throw new AppError('Slug already exists', 409);
    throw new AppError(error.message, 500);
  }
  if (!data) throw new AppError('Podcast not found', 404);
  return mapCategory(data);
}

export async function remove(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('podcasts')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Podcast not found', 404);
  return data;
}

function mapCategory(row: Record<string, unknown>) {
  const categories = row.categories as { name?: string } | null | undefined;
  const { categories: _c, ...rest } = row;
  return {
    ...rest,
    category_name: categories?.name ?? null,
    categories: categories ?? null,
  };
}
