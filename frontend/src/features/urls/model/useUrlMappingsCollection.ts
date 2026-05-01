import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteUrl, getAllUserUrls } from '@/features/urls/api/urlsApi';
import { PAGE_SIZE } from '@/features/urls/lib/urlMappings';
import { urlCopyMessages, urlDeleteMessages } from '@/features/urls/lib/urlMessages';
import type { UrlMapping } from '@/features/urls/types/url';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useClipboard } from '@/shared/lib/useClipboard';
import { useToast } from '@/shared/ui';

export type SortOrder = 'newest' | 'oldest';

export function useUrlMappingsCollection() {
  const [allMappings, setAllMappings] = useState<UrlMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [clientPage, setClientPage] = useState(0);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deletingHash, setDeletingHash] = useState<string | null>(null);

  const toast = useToast();
  const { copiedValue, copyValue } = useClipboard();

  const fetchMappings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllUserUrls();
      setAllMappings(data);
      setPageError(null);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Failed to fetch URL mappings.');
      setPageError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchMappings();
  }, [fetchMappings]);

  useEffect(() => {
    setClientPage(0);
  }, [search, sortOrder]);

  const filteredAndSorted = useMemo(() => {
    const query = search.toLowerCase().trim();
    const filtered = query
      ? allMappings.filter((mapping) => {
          return (
            mapping.originalUrl.toLowerCase().includes(query) ||
            mapping.shortUrl.toLowerCase().includes(query)
          );
        })
      : allMappings;

    return [...filtered].sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return sortOrder === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
    });
  }, [allMappings, search, sortOrder]);

  const totalElements = filteredAndSorted.length;
  const displayTotalPages = Math.ceil(totalElements / PAGE_SIZE);
  const displayMappings = filteredAndSorted.slice(
    clientPage * PAGE_SIZE,
    (clientPage + 1) * PAGE_SIZE,
  );

  const handlePageChange = (page: number) => {
    setClientPage(page);
  };

  const updateMappingsAfterDelete = (hashes: string[]) => {
    setPageError(null);
    setAllMappings((current) => {
      const nextMappings = current.filter((mapping) => !hashes.includes(mapping.urlHash));
      const nextFilteredCount = (() => {
        const query = search.toLowerCase().trim();

        if (!query) {
          return nextMappings.length;
        }

        return nextMappings.filter((mapping) => {
          return (
            mapping.originalUrl.toLowerCase().includes(query) ||
            mapping.shortUrl.toLowerCase().includes(query)
          );
        }).length;
      })();
      const nextTotalPages = Math.ceil(nextFilteredCount / PAGE_SIZE);

      setClientPage((currentPage) => Math.min(currentPage, Math.max(nextTotalPages - 1, 0)));
      return nextMappings;
    });
  };

  const handleDeleteMapping = async (urlHash: string) => {
    setDeletingHash(urlHash);

    try {
      await deleteUrl(urlHash);
      toast.success(urlDeleteMessages.success);
      updateMappingsAfterDelete([urlHash]);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, urlDeleteMessages.failedSingle);
      setPageError(message);
      toast.error(message);
    } finally {
      setDeletingHash(null);
    }
  };

  const handleBulkDelete = async (hashes: string[]) => {
    try {
      await Promise.all(hashes.map((hash) => deleteUrl(hash)));
      toast.success(`${hashes.length} URL${hashes.length !== 1 ? 's' : ''} deleted.`);
      updateMappingsAfterDelete(hashes);
      return true;
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, urlDeleteMessages.failedBatch);
      toast.error(message);
      return false;
    }
  };

  const handleCopyUrl = async (url: string) => {
    const didCopy = await copyValue(url);

    if (!didCopy) {
      toast.error(urlCopyMessages.error);
      return;
    }

    toast.success(urlCopyMessages.success);
  };

  return {
    copiedUrl: copiedValue,
    deletingHash,
    displayMappings,
    displayPage: clientPage,
    displayTotal: totalElements,
    displayTotalPages,
    handleBulkDelete,
    handleCopyUrl,
    handleDeleteMapping,
    handlePageChange,
    isLoading,
    isSearchMode: search.trim().length > 0,
    pageError,
    search,
    setSearch,
    sortOrder,
    toggleSortOrder: () =>
      setSortOrder((current) => (current === 'newest' ? 'oldest' : 'newest')),
    totalElements,
  };
}
