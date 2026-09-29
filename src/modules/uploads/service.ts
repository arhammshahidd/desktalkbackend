import { v4 as uuidv4 } from 'uuid';
import { createPresignedUpload, deleteB2Object } from '../../config/b2.js';
import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { ConfirmInput, PresignInput } from './schema.js';

function throwIfError(error: { message: string } | null) {
  if (error) throw new AppError(error.message, 500);
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function presign(input: PresignInput) {
  const folder = input.folder.replace(/^\/+|\/+$/g, '') || 'uploads';
  const ext = input.filename.includes('.')
    ? input.filename.slice(input.filename.lastIndexOf('.'))
    : '';
  const key = `${folder}/${uuidv4()}${ext || `-${sanitizeFilename(input.filename)}`}`;
  return createPresignedUpload(key, input.contentType);
}

export async function confirm(input: ConfirmInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      key: input.key,
      public_url: input.publicUrl,
      content_type: input.contentType,
      folder: input.folder,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Asset key already exists', 409);
    throw new AppError(error.message, 500);
  }
  return data;
}

export async function remove(id: string) {
  const supabase = getSupabase();
  const { data: asset, error: findError } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  throwIfError(findError);
  if (!asset) throw new AppError('Media asset not found', 404);

  try {
    await deleteB2Object(asset.key);
  } catch (err) {
    console.error('Failed to delete B2 object', err);
  }

  const { data, error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  throwIfError(error);
  return data;
}
