import { describe, expect, it } from 'vitest';
import { abuseReportSchema } from '@/features/urls/model/abuseReportValidation';

describe('abuseReportSchema', () => {
  it('accepts a short URL and optional reason', () => {
    const result = abuseReportSchema.parse({
      shortUrlOrHash: ' https://zuf.uk/abc12345 ',
      reason: ' phishing ',
    });

    expect(result).toEqual({
      shortUrlOrHash: 'https://zuf.uk/abc12345',
      reason: 'phishing',
    });
  });

  it('rejects blank short URL input', () => {
    expect(() => abuseReportSchema.parse({ shortUrlOrHash: '  ' })).toThrow();
  });

  it('rejects overly long reasons', () => {
    expect(() => abuseReportSchema.parse({
      shortUrlOrHash: 'abc12345',
      reason: 'x'.repeat(501),
    })).toThrow();
  });
});
