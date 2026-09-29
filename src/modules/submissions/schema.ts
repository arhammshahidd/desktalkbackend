import { z } from 'zod';

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

export type ContactInput = z.infer<typeof contactSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type HostInput = z.infer<typeof hostSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
