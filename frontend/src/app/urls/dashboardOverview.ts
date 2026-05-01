import { getUserUrlsUpTo } from '@/features/urls/api/urlsApi';
import {
  formatUrlDate,
  getDomainLabel,
  getShortUrlSlug,
} from '@/features/urls/lib/urlMappings';
import type { UrlMapping } from '@/features/urls/types/url';

export type DashboardUrlMapping = UrlMapping;

export async function getDashboardUrlMappings(limit: number) {
  return getUserUrlsUpTo(limit);
}

export { formatUrlDate, getDomainLabel, getShortUrlSlug };
