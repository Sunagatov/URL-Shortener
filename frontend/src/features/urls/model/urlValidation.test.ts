import { createUrlSchema } from './urlValidation';

describe('createUrlSchema', () => {
  it.each([
    'file:///etc/passwd',
    'javascript:alert(1)',
    'https://user:secret@example.com/path',
    'https://localhost:8080/internal',
    'https://127.0.0.1/internal',
    'https://10.0.0.7/internal',
    'https://172.16.0.10/internal',
    'https://192.168.1.10/internal',
    'https://169.254.169.254/latest/meta-data',
    'https://[::1]/internal',
    'https://[fc00::1]/internal',
    'https://zuf.uk/abc12345',
  ])('rejects unsafe destination %s', originalUrl => {
    expect(createUrlSchema.safeParse({ originalUrl }).success).toBe(false);
  });

  it.each([
    'https://example.com/path',
    'http://example.org',
    'https://93.184.216.34/path',
  ])('accepts public destination %s', originalUrl => {
    expect(createUrlSchema.safeParse({ originalUrl }).success).toBe(true);
  });
});
