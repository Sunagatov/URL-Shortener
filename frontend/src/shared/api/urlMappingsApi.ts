import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';
import { normalizeShortUrl } from '@/shared/lib/urlMappings';

export interface UrlMapping {
  urlHash: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  qrScanCount: number;
  createdAt: string;
  expirationDate: string;
  disabled?: boolean;
  disabledReason?: string | null;
  disabledAt?: string | null;
  safetyInterstitialRequired?: boolean;
  safetyInterstitialReason?: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateUrlRequest {
  originalUrl: string;
  daysCount?: number | undefined;
  customAlias?: string | undefined;
  turnstileToken?: string | undefined;
}

export interface AbuseReportRequest {
  shortUrlOrHash: string;
  reason?: string | undefined;
}

export interface AbuseReportResponse {
  reportId: string | null;
  urlHash: string;
}

export const MAX_USER_URLS_PAGE_SIZE = 100;

function normalizeUrlMappingsPage(responseData: PaginatedResponse<UrlMapping>): PaginatedResponse<UrlMapping> {
  return {
    ...responseData,
    content: responseData.content.map((mapping: UrlMapping) => ({
      ...mapping,
      shortUrl: normalizeShortUrl(mapping.shortUrl),
    })),
  };
}

export async function createUrl(data: CreateUrlRequest): Promise<{ shortUrl: string }> {
  const response = await httpClient.post(endpoints.urls.create, data);
  return {
    ...response.data,
    shortUrl: normalizeShortUrl(response.data.shortUrl),
  };
}

export async function getUserUrls(page = 0, size = 6): Promise<PaginatedResponse<UrlMapping>> {
  const response = await httpClient.get(endpoints.urls.list, {
    params: { page, size },
  });

  return normalizeUrlMappingsPage(response.data);
}

export async function getUserUrlsUpTo(limit: number): Promise<UrlMapping[]> {
  const normalizedLimit = Math.max(0, limit);

  if (normalizedLimit === 0) {
    return [];
  }

  const mappings: UrlMapping[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && mappings.length < normalizedLimit) {
    const remaining = normalizedLimit - mappings.length;
    const response = await getUserUrls(page, Math.min(remaining, MAX_USER_URLS_PAGE_SIZE));
    mappings.push(...response.content);
    totalPages = response.totalPages;
    page += 1;
  }

  return mappings;
}

export async function getAllUserUrls(): Promise<UrlMapping[]> {
  const mappings: UrlMapping[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const response = await getUserUrls(page, MAX_USER_URLS_PAGE_SIZE);
    mappings.push(...response.content);
    totalPages = response.totalPages;
    page += 1;
  }

  return mappings;
}

export async function getUrlDetails(hash: string): Promise<UrlMapping> {
  const response = await httpClient.get(endpoints.urls.details(hash));
  return {
    ...response.data,
    shortUrl: normalizeShortUrl(response.data.shortUrl),
  };
}

export async function deleteUrl(hash: string): Promise<void> {
  await httpClient.delete(endpoints.urls.delete(hash));
}

export async function updateUrl(hash: string, originalUrl: string): Promise<UrlMapping> {
  const response = await httpClient.put(endpoints.urls.details(hash), { originalUrl });
  return { ...response.data, shortUrl: normalizeShortUrl(response.data.shortUrl) };
}

export async function reportAbuse(data: AbuseReportRequest): Promise<AbuseReportResponse> {
  const response = await httpClient.post(endpoints.abuseReports.create, data);
  return response.data;
}
