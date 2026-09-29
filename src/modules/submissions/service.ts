import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { ContactInput, GuestInput, HostInput, NewsletterInput } from './schema.js';

function throwIfError(error: { message: string; code?: string } | null) {
  if (error) throw new AppError(error.message, 500);
}

export async function createContact(input: ContactInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert(input)
    .select('*')
    .single();

  throwIfError(error);
  return data;
}

export async function createGuest(input: GuestInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('guest_applications')
    .insert(input)
    .select('*')
    .single();

  throwIfError(error);
  return data;
}

export async function createHost(input: HostInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('host_applications')
    .insert(input)
    .select('*')
    .single();

  throwIfError(error);
  return data;
}

export async function createNewsletter(input: NewsletterInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: input.email.toLowerCase() })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Email already subscribed', 409);
    throw new AppError(error.message, 500);
  }
  return data;
}

export async function listContact() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

export async function listGuest() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('guest_applications')
    .select('*')
    .order('created_at', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

export async function listHost() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('host_applications')
    .select('*')
    .order('created_at', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

export async function listNewsletter() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

const tables = {
  contact: 'contact_submissions',
  guest: 'guest_applications',
  host: 'host_applications',
  newsletter: 'newsletter_subscribers',
} as const;

export type SubmissionKind = keyof typeof tables;

export async function remove(kind: SubmissionKind, id: string) {
  const table = tables[kind];
  if (!table) throw new AppError('Invalid submission type', 400);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  throwIfError(error);
  if (!data) throw new AppError('Submission not found', 404);
  return data;
}
