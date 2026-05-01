import { PAGE_SIZE } from '@/features/urls/lib/urlMappings';
import type { UrlMapping } from '@/features/urls/types/url';

export type SortOrder = 'newest' | 'oldest';

export function sortMappings(urlMappings: UrlMapping[], sortOrder: SortOrder) {
  return [...urlMappings].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();

    return sortOrder === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
  });
}

export function filterMappings(urlMappings: UrlMapping[], search: string) {
  const query = search.toLowerCase().trim();

  return urlMappings.filter((mapping) => {
    return (
      mapping.originalUrl.toLowerCase().includes(query) ||
      mapping.shortUrl.toLowerCase().includes(query)
    );
  });
}

export function getVisibleMappings(
  source: UrlMapping[],
  search: string,
  sortOrder: SortOrder,
) {
  const filteredMappings = search.trim() ? filterMappings(source, search) : source;
  return sortMappings(filteredMappings, sortOrder);
}

export function getClientPageMappings(urlMappings: UrlMapping[], page: number) {
  return urlMappings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
}

export function getClientTotalPages(totalMappings: number) {
  return Math.ceil(totalMappings / PAGE_SIZE);
}

export function getNextServerPageAfterDelete(params: {
  currentPageSize: number;
  deletedCount: number;
  serverPage: number;
}) {
  const { currentPageSize, deletedCount, serverPage } = params;

  return currentPageSize <= deletedCount && serverPage > 0 ? serverPage - 1 : serverPage;
}
