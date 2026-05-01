import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AccountPageHeader,
  AccountPageLayout,
  AccountPageLoadingState,
} from '@/app/layout/AccountPageLayout';
import { routes } from '@/app/routes';
import { formatUrlDate } from '@/features/urls/lib/urlMappings';
import { urlDeleteMessages } from '@/features/urls/lib/urlMessages';
import { useUserUrlMappings } from '@/features/urls/model/useUserUrlMappings';
import { UrlMappingCard } from '@/features/urls/ui/UrlMappingCard';
import { UrlMappingsEmptyState } from '@/features/urls/ui/UrlMappingsEmptyState';
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
    toggleSortOrder,
    totalElements,
  } = useUserUrlMappings();

  const handleConfirmDelete = async () => {
    if (!pendingDeleteHash) {
      return;
    }

    await handleDeleteMapping(pendingDeleteHash);
    setPendingDeleteHash(null);
  };

  const handleConfirmBulkDelete = async () => {
    const deleted = await handleBulkDelete();

    if (deleted) {
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
        <>
          <style>{`
            @keyframes urlCardIn {
              from { opacity: 0; transform: translateY(10px); }
              to   { opacity: 1; transform: translateY(0);    }
            }
          `}</style>
          <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {displayMappings.map((mapping, index) => (
              <div
                key={mapping.urlHash}
                style={{
                  animation: 'urlCardIn 0.35s ease both',
                  animationDelay: `${index * 60}ms`,
                }}
              >
                <UrlMappingCard
                  copiedUrl={copiedUrl}
                  formatDate={formatUrlDate}
                  isDeleting={deletingHash === mapping.urlHash}
                  isSelectMode={isSelectMode}
                  isSelected={selectedHashes.has(mapping.urlHash)}
                  mapping={mapping}
                  onCopy={handleCopyUrl}
                  onDelete={() => setPendingDeleteHash(mapping.urlHash)}
                  onDetails={() => navigate(routes.urlDetails(mapping.urlHash))}
                  onToggleSelect={() => toggleSelect(mapping.urlHash)}
                />
              </div>
            ))}
          </div>
        </>
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
