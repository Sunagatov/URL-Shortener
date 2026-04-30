import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { deleteUrl, getUserUrls } from '@/features/urls/api/urlsApi';
import { urlCopyMessages, urlDeleteMessages } from '@/features/urls/lib/urlMessages';
import { PAGE_SIZE } from '@/features/urls/lib/urlMappings';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/apiErrors';
import { useClipboard } from '@/shared/lib/useClipboard';
import type { UrlMapping } from '@/shared/types';
import { useToast } from '@/shared/ui';

export type SortOrder = 'newest' | 'oldest';
export type SelectionSet = Set<string>;

function sortMappings(urlMappings: UrlMapping[], sortOrder: SortOrder) {
  return [...urlMappings].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return sortOrder === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
  });
}

function filterMappings(urlMappings: UrlMapping[], search: string) {
  const query = search.toLowerCase().trim();

  return urlMappings.filter((mapping) => {
    return (
      mapping.originalUrl.toLowerCase().includes(query) ||
      mapping.shortUrl.toLowerCase().includes(query)
    );
  });
}

export function useUrlMappingsCollection() {
  const [urlMappings, setUrlMappings] = useState<UrlMapping[]>([]);
  const [allMappings, setAllMappings] = useState<UrlMapping[]>([]);
  const [serverPage, setServerPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [allLoaded, setAllLoaded] = useState(false);
  const [clientPage, setClientPage] = useState(0);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deletingHash, setDeletingHash] = useState<string | null>(null);

  const navigate = useNavigate();
  const toast = useToast();
  const { copiedValue, copyValue } = useClipboard();
  const isSearchMode = search.trim().length > 0;

  const redirectToSignIn = useCallback(() => {
    navigate(routes.signIn, { replace: true });
  }, [navigate]);

  const fetchPage = useCallback(
    async (pageNumber: number) => {
      try {
        setIsLoading(true);
        const data = await getUserUrls(pageNumber, PAGE_SIZE);
        setUrlMappings(data.content);
        setServerPage(data.page);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setPageError(null);
      } catch (error: unknown) {
        if (getApiErrorStatus(error) === 401) {
          redirectToSignIn();
          return;
        }

        const message = getApiErrorMessage(error, 'Failed to fetch URL mappings.');
        setPageError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [redirectToSignIn, toast],
  );

  const fetchAll = useCallback(async () => {
    try {
      const data = await getUserUrls(0, 500);
      setAllMappings(data.content);
      setAllLoaded(true);
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 401) {
        redirectToSignIn();
      }
    }
  }, [redirectToSignIn]);

  useEffect(() => {
    void fetchPage(0);
  }, [fetchPage]);

  useEffect(() => {
    if (search.trim() && !allLoaded) {
      void fetchAll();
    }

    setClientPage(0);
  }, [allLoaded, fetchAll, search]);

  const filteredAndSorted = useMemo(() => {
    const source = isSearchMode ? allMappings : urlMappings;
    const visibleMappings = isSearchMode ? filterMappings(source, search) : source;
    return sortMappings(visibleMappings, sortOrder);
  }, [allMappings, isSearchMode, search, sortOrder, urlMappings]);

  const clientTotalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);
  const displayMappings = isSearchMode
    ? filteredAndSorted.slice(clientPage * PAGE_SIZE, (clientPage + 1) * PAGE_SIZE)
    : filteredAndSorted;

  const handlePageChange = (page: number) => {
    if (isSearchMode) {
      setClientPage(page);
      return;
    }

    setServerPage(page);
    void fetchPage(page);
  };

  const updateMappingsAfterDelete = async (hashes: string[]) => {
    setPageError(null);
    setTotalElements((current) => current - hashes.length);
    setAllMappings((current) => current.filter((mapping) => !hashes.includes(mapping.urlHash)));

    if (isSearchMode) {
      return;
    }

    const nextPage =
      urlMappings.length <= hashes.length && serverPage > 0 ? serverPage - 1 : serverPage;
    await fetchPage(nextPage);
  };

  const handleDeleteMapping = async (urlHash: string) => {
    setDeletingHash(urlHash);

    try {
      await deleteUrl(urlHash);
      toast.success(urlDeleteMessages.success);
      await updateMappingsAfterDelete([urlHash]);
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 401) {
        redirectToSignIn();
        return;
      }

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
      await updateMappingsAfterDelete(hashes);
      return true;
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 401) {
        redirectToSignIn();
        return false;
      }

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
    displayPage: isSearchMode ? clientPage : serverPage,
    displayTotal: isSearchMode ? filteredAndSorted.length : totalElements,
    displayTotalPages: isSearchMode ? clientTotalPages : totalPages,
    handleBulkDelete,
    handleCopyUrl,
    handleDeleteMapping,
    handlePageChange,
    isLoading,
    isSearchMode,
    pageError,
    search,
    setSearch,
    sortOrder,
    toggleSortOrder: () =>
      setSortOrder((current) => (current === 'newest' ? 'oldest' : 'newest')),
    totalElements,
  };
}

export function useUrlMappingsSelection(displayMappings: UrlMapping[]) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedHashes, setSelectedHashes] = useState<SelectionSet>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((current) => !current);
    setSelectedHashes(new Set());
  }, []);

  const toggleSelect = useCallback((hash: string) => {
    setSelectedHashes((current) => {
      const next = new Set(current);

      if (next.has(hash)) {
        next.delete(hash);
      } else {
        next.add(hash);
      }

      return next;
    });
  }, []);

  const isAllSelected =
    displayMappings.length > 0 &&
    displayMappings.every((mapping) => selectedHashes.has(mapping.urlHash));

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedHashes(new Set());
      return;
    }

    setSelectedHashes(new Set(displayMappings.map((mapping) => mapping.urlHash)));
  }, [displayMappings, isAllSelected]);

  return {
    clearSelection: () => {
      setSelectedHashes(new Set());
      setIsSelectMode(false);
    },
    isAllSelected,
    isBulkDeleting,
    isSelectMode,
    selectedHashes,
    setIsBulkDeleting,
    toggleSelect,
    toggleSelectAll,
    toggleSelectMode,
  };
}
