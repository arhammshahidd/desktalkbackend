import { z } from 'zod';

export const podcastSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  summary: z.string().optional().default(''),
  description: z.string().optional().default(''),
  thumbnail_url: z.string().optional().default(''),
  video_url: z.string().optional().default(''),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  host_name: z.string().optional().default(''),
  host_photo_url: z.string().optional().default(''),
  guest_name: z.string().optional().default(''),
  guest_photo_url: z.string().optional().default(''),
  sponsor_logo_url: z.string().optional().default(''),
  category_id: z.string().uuid().nullable().optional(),
  published: z.boolean().optional().default(false),
  sort_order: z.coerce.number().optional().default(0),
});

export const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional().default(''),
  body: z.string().optional().default(''),
  cover_url: z.string().optional().default(''),
  category_id: z.string().uuid().nullable().optional(),
  author_name: z.string().optional().default('Desktalk'),
  published: z.boolean().optional().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  type: z.enum(['podcast', 'blog']),
});

export const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default(''),
  bio: z.string().optional().default(''),
  photo_url: z.string().optional().default(''),
  sort_order: z.coerce.number().optional().default(0),
});

export const partnerSchema = z.object({
  name: z.string().min(1),
  logo_url: z.string().optional().default(''),
  sort_order: z.coerce.number().optional().default(0),
});

export const pageSettingSchema = z.object({
  value: z.record(z.unknown()),
});

export const contactSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  company: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  enquiry: z.string().min(1),
  accepted_terms: z.boolean(),
});

export const guestSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  company: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  topic: z.string().optional().default(''),
  message: z.string().optional().default(''),
});

export const hostSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  company: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  experience: z.string().optional().default(''),
  message: z.string().optional().default(''),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const presignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().optional().default('uploads'),
});

export const confirmUploadSchema = z.object({
  key: z.string().min(1),
  publicUrl: z.string().url(),
  contentType: z.string().optional().default(''),
  folder: z.string().optional().default('uploads'),
});
