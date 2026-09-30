import { z } from 'zod';

export const blogBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional().default(''),
  body: z.string().optional().default(''),
  cover_url: z.string().optional().default(''),
  category_id: z.string().uuid().nullable().optional(),
  author_name: z.string().optional().default('Desktalk'),
  author_role: z.string().optional().default(''),
  author_photo_url: z.string().optional().default(''),
  author_linkedin: z.string().optional().default(''),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .optional()
    .default([]),
  published: z.boolean().optional().default(false),
  published_at: z.string().datetime().nullable().optional(),
});

export const blogUpdateSchema = blogBodySchema.partial().extend({
  title: z.string().min(1).optional(),
});

export type BlogBody = z.infer<typeof blogBodySchema>;
export type BlogUpdate = z.infer<typeof blogUpdateSchema>;
