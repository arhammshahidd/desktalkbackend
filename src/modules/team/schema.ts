import { z } from 'zod';

export const teamBodySchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default(''),
  bio: z.string().optional().default(''),
  photo_url: z.string().optional().default(''),
  sort_order: z.coerce.number().int().optional().default(0),
});

export const teamUpdateSchema = teamBodySchema.partial().extend({
  name: z.string().min(1).optional(),
});

export type TeamBody = z.infer<typeof teamBodySchema>;
export type TeamUpdate = z.infer<typeof teamUpdateSchema>;
