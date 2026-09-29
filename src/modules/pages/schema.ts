import { z } from 'zod';

export const pageUpdateSchema = z.object({
  value: z.record(z.string(), z.unknown()),
});

export type PageUpdate = z.infer<typeof pageUpdateSchema>;
