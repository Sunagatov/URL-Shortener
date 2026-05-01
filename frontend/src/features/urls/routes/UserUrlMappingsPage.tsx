import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AccountPageHeader,
  AccountPageLayout,
  AccountPageLoadingState,
} from '@/app/account/contracts';
import { routes } from '@/app/routes';
import { urlDeleteMessages } from '@/features/urls/lib/urlMessages';
import { useUrlMappingsCollection } from '@/features/urls/model/useUrlMappingsCollection';
import { useUrlMappingsSelection } from '@/features/urls/model/useUrlMappingsSelection';
import { UrlMappingsEmptyState } from '@/features/urls/ui/UrlMappingsEmptyState';
import { UrlMappingsGrid } from '@/features/urls/ui/UrlMappingsGrid';
import { UrlMappingsPagination } from '@/features/urls/ui/UrlMappingsPagination';
import { UrlMappingsSelectionBar } from '@/features/urls/ui/UrlMappingsSelectionBar';
import { UrlMappingsToolbar } from '@/features/urls/ui/UrlMappingsToolbar';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button, ConfirmModal } from '@/shared/ui';
import { FaCheckSquare, FaPlus } from 'react-icons/fa';

const UserUrlMappingsPage: React.FC = () => {
  usePageTitle('My URLs');
  const navigate = useNavigate();
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pendingDeleteHash, setPendingDeleteHash] = useState<string | null>(null);
  const collection = useUrlMappingsCollection();
  const selection = useUrlMappingsSelection(collection.displayMappings);
  const {
    copiedUrl,
    deletingHash,
    displayMappings,
    displayPage,
    displayTotal,
    displayTotalPages,
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
    toggleSortOrder,
    totalElements,
  } = collection;
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
  } = selection;

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
        displayTotal={displayTotal}
        isSearchMode={isSearchMode}
        search={search}
        sortOrder={sortOrder}
        totalElements={totalElements}
        onClearSearch={() => setSearch('')}
        onSearchChange={setSearch}
        onToggleSortOrder={toggleSortOrder}
      />

      {pageError ? (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-900/15 px-4 py-3 text-sm text-red-300">
          {pageError}
        </div>
      ) : null}

      {displayMappings.length > 0 ? (
        <UrlMappingsGrid
          copiedUrl={copiedUrl}
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
          page={displayPage}
          total={displayTotal}
          totalPages={displayTotalPages}
          onPageChange={handlePageChange}
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
