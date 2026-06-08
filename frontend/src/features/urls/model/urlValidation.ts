import { z } from 'zod';
import { getPublicShortUrlBase } from '@/features/urls/lib/urlMappings';

const unsafeDestinationMessage = 'This destination URL is not allowed for security reasons';

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .refine(isSafeDestinationUrl, unsafeDestinationMessage),
  daysCount: z.preprocess(
    value => (value === '' ? undefined : value),
    z.coerce.number().int().min(1).max(365).optional()
  ),
  customAlias: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, 'Only letters, numbers, hyphens, and underscores')
    .min(3, 'Alias must be at least 3 characters')
    .max(30, 'Alias must be at most 30 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateUrlFormData = z.infer<typeof createUrlSchema>;

function isSafeDestinationUrl(value: string): boolean {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return false;
  }

  if (url.username || url.password) {
    return false;
  }

  const hostname = normalizeHostname(url.hostname);

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return false;
  }

  if (isPrivateIpv4(hostname) || isBlockedIpv6(hostname)) {
    return false;
  }

  return !isShortenerSelfLink(hostname);
}

function isPrivateIpv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) {
    return false;
  }

  const [, firstValue, secondValue, thirdValue, fourthValue] = match;
  const octets = [firstValue, secondValue, thirdValue, fourthValue].map(Number);

  if (octets.some(octet => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  const [first, second, third] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 192 && second === 88 && third === 99) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 240
  );
}

function isBlockedIpv6(hostname: string): boolean {
  const normalized = hostname.replace(/^\[/, '').replace(/\]$/, '').toLowerCase();
  return (
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('2001:db8:')
  );
}

function isShortenerSelfLink(hostname: string): boolean {
  return getShortenerHostnames().has(hostname);
}

function getShortenerHostnames(): Set<string> {
  const hostnames = new Set(['zuf.uk', 'www.zuf.uk', 'api.zuf.uk']);

  addHostname(hostnames, getPublicShortUrlBase());
  addHostname(hostnames, import.meta.env.VITE_BACKEND_REST_API_URL);

  return hostnames;
}

function addHostname(hostnames: Set<string>, value: string | null | undefined) {
  if (!value) {
    return;
  }

  try {
    hostnames.add(normalizeHostname(new URL(value).hostname));
  } catch {
    // Ignore invalid build-time configuration; backend validation remains authoritative.
  }
}

function normalizeHostname(value: string): string {
  return value.toLowerCase().replace(/\.+$/, '');
}
