import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';
import { normalizeShortUrl } from '@/features/urls/lib/urlMappings';
import type { CreateUrlRequest, PaginatedResponse, UrlMapping } from '@/shared/types';

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

  return {
    ...response.data,
    content: response.data.content.map((mapping: UrlMapping) => ({
      ...mapping,
      shortUrl: normalizeShortUrl(mapping.shortUrl),
    })),
  };
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
