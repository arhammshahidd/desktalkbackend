import { z } from 'zod';

export const categoryBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  type: z.enum(['podcast', 'blog']),
});

export const categoryUpdateSchema = categoryBodySchema.partial().extend({
  name: z.string().min(1).optional(),
  type: z.enum(['podcast', 'blog']).optional(),
});

export const categoryQuerySchema = z.object({
  type: z.enum(['podcast', 'blog']).optional(),
});

export type CategoryBody = z.infer<typeof categoryBodySchema>;
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;
