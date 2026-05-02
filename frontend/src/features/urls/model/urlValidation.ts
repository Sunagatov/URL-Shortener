import { z } from 'zod';

export const createUrlSchema = z.object({
  originalUrl: z.string().min(1, 'URL is required').url('Please enter a valid URL'),
  daysCount: z.coerce.number().int().min(1).max(365).optional(),
  customAlias: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, 'Only letters, numbers, hyphens, and underscores')
    .min(3, 'Alias must be at least 3 characters')
    .max(30, 'Alias must be at most 30 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateUrlFormData = z.infer<typeof createUrlSchema>;
