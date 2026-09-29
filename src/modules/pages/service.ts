import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { PageUpdate } from './schema.js';

function throwIfError(error: { message: string } | null) {
  if (error) throw new AppError(error.message, 500);
}

export async function getByKey(key: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('page_settings')
    .select('*')
    .eq('key', key)
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Page not found', 404);
  return data;
}

export async function listAll() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('page_settings')
    .select('*')
    .order('key', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function upsert(key: string, input: PageUpdate) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('page_settings')
    .upsert(
      { key, value: input.value, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    )
    .select('*')
    .single();

  throwIfError(error);
  return data;
}
