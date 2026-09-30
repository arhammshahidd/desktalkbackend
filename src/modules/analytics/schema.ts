import { z } from 'zod';

export const trackViewSchema = z.object({
  visitorId: z.string().min(8).max(80),
  path: z.string().min(1).max(500),
  pageType: z.enum(['page', 'podcast', 'blog']).default('page'),
  contentId: z.string().uuid().optional().nullable(),
  contentSlug: z.string().max(200).optional().default(''),
  contentTitle: z.string().max(300).optional().default(''),
  referrer: z.string().max(500).optional().default(''),
});

export type TrackViewInput = z.infer<typeof trackViewSchema>;
