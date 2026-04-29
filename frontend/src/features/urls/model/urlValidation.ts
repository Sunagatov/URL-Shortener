import { z } from 'zod';

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL'),
  daysCount: z.coerce.number().int().min(1).max(365).optional(),
});

export type CreateUrlFormData = z.infer<typeof createUrlSchema>;
