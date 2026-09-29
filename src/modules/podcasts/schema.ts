import { z } from 'zod';

export const podcastBodySchema = z.object({
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
  published_at: z.string().datetime().nullable().optional(),
  sort_order: z.coerce.number().int().optional().default(0),
});

export const podcastUpdateSchema = podcastBodySchema.partial().extend({
  title: z.string().min(1).optional(),
});

export type PodcastBody = z.infer<typeof podcastBodySchema>;
export type PodcastUpdate = z.infer<typeof podcastUpdateSchema>;
