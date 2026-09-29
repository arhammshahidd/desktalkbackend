import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { PartnerBody, PartnerUpdate } from './schema.js';

function throwIfError(error: { message: string } | null) {
  if (error) throw new AppError(error.message, 500);
}

export async function list() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function create(input: PartnerBody) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('partners').insert(input).select('*').single();
  throwIfError(error);
  return data;
}

export async function update(id: string, input: PartnerUpdate) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('partners')
    .update(input)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Partner not found', 404);
  return data;
}

export async function remove(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Partner not found', 404);
  return data;
}
