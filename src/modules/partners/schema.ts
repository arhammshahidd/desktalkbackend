import { z } from 'zod';

export const partnerBodySchema = z.object({
  name: z.string().min(1),
  logo_url: z.string().min(1),
  sort_order: z.coerce.number().int().optional().default(0),
});

export const partnerUpdateSchema = partnerBodySchema.partial().extend({
  name: z.string().min(1).optional(),
  logo_url: z.string().min(1).optional(),
});

export type PartnerBody = z.infer<typeof partnerBodySchema>;
export type PartnerUpdate = z.infer<typeof partnerUpdateSchema>;
