import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AccountPageHeader,
  AccountPageLayout,
  AccountPageLoadingState,
} from '@/features/account/ui/layout/AccountPageLayout';
import { routes } from '@/app/routes';
import { deleteUrl, getAllUserUrls } from '@/features/urls/api/urlsApi';
import { PAGE_SIZE } from '@/features/urls/lib/urlMappings';
import { urlCopyMessages, urlDeleteMessages } from '@/features/urls/lib/urlMessages';
import { useUrlMappingsSelection } from '@/features/urls/model/useUrlMappingsSelection';
import type { UrlMapping } from '@/features/urls/types/url';
import { UrlMappingsEmptyState } from '@/features/urls/ui/UrlMappingsEmptyState';
import { UrlMappingsGrid } from '@/features/urls/ui/UrlMappingsGrid';
import { UrlMappingsPagination } from '@/features/urls/ui/UrlMappingsPagination';
import { UrlMappingsSelectionBar } from '@/features/urls/ui/UrlMappingsSelectionBar';
import { UrlMappingsToolbar } from '@/features/urls/ui/UrlMappingsToolbar';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useClipboard } from '@/shared/lib/useClipboard';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button, ConfirmModal, useToast } from '@/shared/ui';
import { FaCheckSquare, FaPlus } from 'react-icons/fa';

const UserUrlMappingsPage: React.FC = () => {
  usePageTitle('My URLs');
  const navigate = useNavigate();
  const toast = useToast();
  const { copiedValue, copyValue } = useClipboard();
  const [allMappings, setAllMappings] = useState<UrlMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [clientPage, setClientPage] = useState(0);
  const [pageError, setPageError] = useState<string | null>(null);
  const [deletingHash, setDeletingHash] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pendingDeleteHash, setPendingDeleteHash] = useState<string | null>(null);
  const isSearchMode = search.trim().length > 0;

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

  const {
    isAllSelected,
    isBulkDeleting,
    isSelectMode,
    selectedHashes,
    setIsBulkDeleting,
    toggleSelect,
    toggleSelectAll,
    toggleSelectMode,
    clearSelection,
  } = useUrlMappingsSelection(displayMappings);

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

  const handleConfirmDelete = async () => {
    if (!pendingDeleteHash) {
      return;
    }

    await handleDeleteMapping(pendingDeleteHash);
    setPendingDeleteHash(null);
  };

  const handleConfirmBulkDelete = async () => {
    setIsBulkDeleting(true);

    let deleted = false;

    try {
      deleted = await handleBulkDelete([...selectedHashes]);
    } finally {
      setIsBulkDeleting(false);
    }

    if (deleted) {
      clearSelection();
      setShowBulkConfirm(false);
    }
  };

  if (isLoading) {
    return <AccountPageLoadingState message="Loading your URLs…" />;
  }

  return (
    <AccountPageLayout contentClassName="mx-auto flex min-h-full max-w-6xl flex-col">
      <AccountPageHeader
        title="My URLs"
        description="Manage and track your shortened links"
        actions={
          <div className="flex items-center gap-2">
            {totalElements > 0 ? (
              <Button
                onClick={toggleSelectMode}
                variant={isSelectMode ? 'ghost' : 'secondary'}
                size="sm"
              >
                <FaCheckSquare className="h-3.5 w-3.5" />
                <span>{isSelectMode ? 'Cancel' : 'Select'}</span>
              </Button>
            ) : null}
            {!isSelectMode ? (
              <Button onClick={() => navigate(routes.home)} variant="primary" size="sm">
                <FaPlus className="h-3.5 w-3.5" />
                <span>New URL</span>
              </Button>
            ) : null}
          </div>
        }
      />

      <UrlMappingsToolbar
        displayTotal={totalElements}
        isSearchMode={isSearchMode}
        search={search}
        sortOrder={sortOrder}
        totalElements={totalElements}
        onClearSearch={() => setSearch('')}
        onSearchChange={setSearch}
        onToggleSortOrder={() =>
          setSortOrder((current) => (current === 'newest' ? 'oldest' : 'newest'))
        }
      />

      {pageError ? (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-900/15 px-4 py-3 text-sm text-red-300">
          {pageError}
        </div>
      ) : null}

      {displayMappings.length > 0 ? (
        <UrlMappingsGrid
          copiedUrl={copiedValue}
          deletingHash={deletingHash}
          isSelectMode={isSelectMode}
          mappings={displayMappings}
          selectedHashes={selectedHashes}
          onCopy={handleCopyUrl}
          onDelete={setPendingDeleteHash}
          onDetails={(urlHash) => navigate(routes.urlDetails(urlHash))}
          onToggleSelect={toggleSelect}
        />
      ) : isSearchMode ? (
        <UrlMappingsEmptyState
          actionLabel="Clear search"
          description={
            <>
              No URLs match "<span className="text-white/55">{search}</span>"
            </>
          }
          icon="search"
          onAction={() => setSearch('')}
          title="No results"
        />
      ) : (
        <UrlMappingsEmptyState
          actionLabel="Create Short URL"
          description="Shorten your first link and start tracking clicks."
          icon="link"
          onAction={() => navigate(routes.home)}
          title="No URLs yet"
        />
      )}

      {displayTotalPages > 1 ? (
        <UrlMappingsPagination
          page={clientPage}
          total={totalElements}
          totalPages={displayTotalPages}
          onPageChange={setClientPage}
        />
      ) : null}

      {isSelectMode ? (
        <UrlMappingsSelectionBar
          isAllSelected={isAllSelected}
          onDelete={() => setShowBulkConfirm(true)}
          onToggleSelectAll={toggleSelectAll}
          selectedCount={selectedHashes.size}
        />
      ) : null}

      <ConfirmModal
        isOpen={pendingDeleteHash !== null}
        title={urlDeleteMessages.confirmTitle}
        message={urlDeleteMessages.confirmMessage}
        confirmLabel="Delete"
        isLoading={deletingHash !== null}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDeleteHash(null)}
      />

      <ConfirmModal
        isOpen={showBulkConfirm}
        title={`Delete ${selectedHashes.size} URL${selectedHashes.size !== 1 ? 's' : ''}?`}
        message="These short links will stop working immediately and cannot be restored."
        confirmLabel={`Delete ${selectedHashes.size}`}
        isLoading={isBulkDeleting}
        onConfirm={() => void handleConfirmBulkDelete()}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </AccountPageLayout>
  );
};

export default UserUrlMappingsPage;
