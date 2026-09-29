import { z } from 'zod';

export const presignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().min(1).optional().default('uploads'),
});

export const confirmSchema = z.object({
  key: z.string().min(1),
  publicUrl: z.string().url(),
  contentType: z.string().optional().default(''),
  folder: z.string().optional().default('uploads'),
});

export type PresignInput = z.infer<typeof presignSchema>;
export type ConfirmInput = z.infer<typeof confirmSchema>;
