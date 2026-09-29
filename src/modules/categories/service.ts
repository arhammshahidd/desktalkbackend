import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { slugify } from '../../utils/helpers.js';
import type { CategoryBody, CategoryUpdate } from './schema.js';

function throwIfError(error: { message: string } | null) {
  if (error) throw new AppError(error.message, 500);
}

export async function list(type?: string) {
  const supabase = getSupabase();
  let query = supabase.from('categories').select('*').order('name', { ascending: true });
  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  throwIfError(error);
  return data ?? [];
}

export async function listAll() {
  return list();
}

export async function create(input: CategoryBody) {
  const supabase = getSupabase();
  const slug = input.slug?.trim() || slugify(input.name);

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: input.name, slug, type: input.type })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Slug already exists', 409);
    throw new AppError(error.message, 500);
  }
  return data;
}

export async function update(id: string, input: CategoryUpdate) {
  const supabase = getSupabase();
  const payload: Record<string, unknown> = { ...input };
  if (input.name && !input.slug) {
    payload.slug = slugify(input.name);
  }

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') throw new AppError('Slug already exists', 409);
    throw new AppError(error.message, 500);
  }
  if (!data) throw new AppError('Category not found', 404);
  return data;
}

export async function remove(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Category not found', 404);
  return data;
}
