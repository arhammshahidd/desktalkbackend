import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { TeamBody, TeamUpdate } from './schema.js';

function throwIfError(error: { message: string } | null) {
  if (error) throw new AppError(error.message, 500);
}

export async function list() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function create(input: TeamBody) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('team_members')
    .insert({ ...input, updated_at: new Date().toISOString() })
    .select('*')
    .single();

  throwIfError(error);
  return data;
}

export async function update(id: string, input: TeamUpdate) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('team_members')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Team member not found', 404);
  return data;
}

export async function remove(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Team member not found', 404);
  return data;
}
