import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../../config/supabase.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { AuthPayload } from '../../middleware/auth.js';

export async function login(email: string, password: string) {
  const supabase = getSupabase();
  const { data: admin, error } = await supabase
    .from('admins')
    .select('id, email, name, password_hash')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!admin) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  if (!env.jwtSecret) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }

  const payload: AuthPayload = { sub: admin.id, email: admin.email, name: admin.name };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);

  return {
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  };
}

export async function getAdminById(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('admins')
    .select('id, email, name')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Admin not found', 404);
  return data;
}

export async function upsertAdmin(email: string, password: string, name: string) {
  const hash = await bcrypt.hash(password, 10);
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('admins')
    .upsert(
      { email: email.toLowerCase(), password_hash: hash, name, updated_at: new Date().toISOString() },
      { onConflict: 'email' },
    )
    .select('id, email, name')
    .single();
  if (error) throw new AppError(error.message, 500);
  return data;
}
