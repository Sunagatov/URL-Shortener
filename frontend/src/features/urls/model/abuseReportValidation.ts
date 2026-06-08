import { z } from 'zod';

export const abuseReportSchema = z.object({
  shortUrlOrHash: z.string().trim().min(3, 'Enter a short URL or code').max(2048, 'Short URL is too long'),
  reason: z.string().trim().max(500, 'Reason is too long').optional(),
});

export type AbuseReportFormData = z.output<typeof abuseReportSchema>;
