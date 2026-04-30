import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { PAGE_SIZE } from '@/features/urls/lib/urlMappings';
import { deleteUrl, getUserUrls } from '@/features/urls/api/urlsApi';
import { useClipboard } from '@/shared/lib/useClipboard';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/apiErrors';
import type { UrlMapping } from '@/shared/types';
import { useToast } from '@/shared/ui';

type SortOrder = 'newest' | 'oldest';
type SelectionSet = Set<string>;

export const useUserUrlMappings = () => {
  const [urlMappings, setUrlMappings] = useState<UrlMapping[]>([]);
  const [serverPage, setServerPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [allMappings, setAllMappings] = useState<UrlMapping[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [clientPage, setClientPage] = useState(0);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deletingHash, setDeletingHash] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedHashes, setSelectedHashes] = useState<SelectionSet>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const { copiedValue, copyValue } = useClipboard();

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
    [redirectToSignIn, toast]
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

  const isSearchMode = search.trim().length > 0;

  const filteredAndSorted = useMemo(() => {
    const source = isSearchMode ? allMappings : urlMappings;
    const query = search.toLowerCase().trim();
    const filtered = isSearchMode
      ? source.filter(mapping => {
          return (
            mapping.originalUrl.toLowerCase().includes(query) ||
            mapping.shortUrl.toLowerCase().includes(query)
          );
        })
      : source;

    return [...filtered].sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return sortOrder === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
    });
  }, [allMappings, isSearchMode, search, sortOrder, urlMappings]);

  const clientTotalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);
  const displayMappings = isSearchMode
    ? filteredAndSorted.slice(clientPage * PAGE_SIZE, (clientPage + 1) * PAGE_SIZE)
    : filteredAndSorted;
  const displayTotalPages = isSearchMode ? clientTotalPages : totalPages;
  const displayPage = isSearchMode ? clientPage : serverPage;
  const displayTotal = isSearchMode ? filteredAndSorted.length : totalElements;

  const handlePageChange = (page: number) => {
    if (isSearchMode) {
      setClientPage(page);
      return;
    }

    setServerPage(page);
    void fetchPage(page);
  };

  const handleDeleteMapping = async (urlHash: string) => {
    if (!window.confirm('This short link will stop working immediately and cannot be restored.')) {
      return;
    }

    setDeletingHash(urlHash);
    try {
      await deleteUrl(urlHash);
      toast.success('URL deleted successfully.');
      setPageError(null);
      if (isSearchMode) {
        setAllMappings(previous => previous.filter(mapping => mapping.urlHash !== urlHash));
      } else {
        const nextPage = urlMappings.length === 1 && serverPage > 0 ? serverPage - 1 : serverPage;
        await fetchPage(nextPage);
      }
      setTotalElements(previous => previous - 1);
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 401) {
        redirectToSignIn();
        return;
      }
      const message = getApiErrorMessage(error, 'Failed to delete URL mapping.');
      setPageError(message);
      toast.error(message);
    } finally {
      setDeletingHash(null);
    }
  };

  const handleCopyUrl = async (url: string) => {
    const didCopy = await copyValue(url);
    if (!didCopy) {
      toast.error('Unable to copy URL.');
      return;
    }
    toast.success('Copied to clipboard');
  };

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(previous => !previous);
    setSelectedHashes(new Set());
  }, []);

  const toggleSelect = useCallback((hash: string) => {
    setSelectedHashes(previous => {
      const next = new Set(previous);
      if (next.has(hash)) next.delete(hash);
      else next.add(hash);
      return next;
    });
  }, []);

  const isAllSelected =
    displayMappings.length > 0 && displayMappings.every(m => selectedHashes.has(m.urlHash));

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedHashes(new Set());
    } else {
      setSelectedHashes(new Set(displayMappings.map(m => m.urlHash)));
    }
  }, [isAllSelected, displayMappings]);

  const handleBulkDelete = useCallback(async () => {
    const hashes = [...selectedHashes];
    setIsBulkDeleting(true);
    try {
      await Promise.all(hashes.map(hash => deleteUrl(hash)));
      toast.success(`${hashes.length} URL${hashes.length !== 1 ? 's' : ''} deleted.`);
      setSelectedHashes(new Set());
      setIsSelectMode(false);
      setTotalElements(previous => previous - hashes.length);
      if (isSearchMode) {
        setAllMappings(previous => previous.filter(m => !hashes.includes(m.urlHash)));
      } else {
        const nextPage =
          urlMappings.length <= hashes.length && serverPage > 0 ? serverPage - 1 : serverPage;
        await fetchPage(nextPage);
      }
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 401) {
        redirectToSignIn();
        return;
      }
      const message = getApiErrorMessage(error, 'Failed to delete some URLs.');
      toast.error(message);
    } finally {
      setIsBulkDeleting(false);
    }
  }, [
    selectedHashes,
    toast,
    isSearchMode,
    urlMappings.length,
    serverPage,
    fetchPage,
    redirectToSignIn,
  ]);

  return {
    copiedUrl: copiedValue,
    deletingHash,
    displayMappings,
    displayPage,
    displayTotal,
    displayTotalPages,
    handleBulkDelete,
    handleCopyUrl,
    handleDeleteMapping,
    handlePageChange,
    isAllSelected,
    isBulkDeleting,
    isLoading,
    isSearchMode,
    isSelectMode,
    pageError,
    search,
    selectedHashes,
    setSearch,
    sortOrder,
    toggleSelect,
    toggleSelectAll,
    toggleSelectMode,
    toggleSortOrder: () => setSortOrder(current => (current === 'newest' ? 'oldest' : 'newest')),
    totalElements,
  };
};
