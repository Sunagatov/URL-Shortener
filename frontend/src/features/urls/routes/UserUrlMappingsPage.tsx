import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AccountPageHeader,
  AccountPageLayout,
  AccountPageLoadingState,
} from '@/app/layout/AccountPageLayout';
import { routes } from '@/app/routes';
import { formatUrlDate, PAGE_SIZE } from '@/features/urls/lib/urlMappings';
import { useUserUrlMappings } from '@/features/urls/model/useUserUrlMappings';
import { UrlMappingCard } from '@/features/urls/ui/UrlMappingCard';
import { UrlMappingsPagination } from '@/features/urls/ui/UrlMappingsPagination';
import { UrlMappingsToolbar } from '@/features/urls/ui/UrlMappingsToolbar';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button, ConfirmModal } from '@/shared/ui';
import { FaCheckSquare, FaLink, FaPlus, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';

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
            {totalElements > 0 && (
              <Button
                onClick={toggleSelectMode}
                variant={isSelectMode ? 'ghost' : 'secondary'}
                size="sm"
              >
                <FaCheckSquare className="w-3.5 h-3.5" />
                <span>{isSelectMode ? 'Cancel' : 'Select'}</span>
              </Button>
            )}
            {!isSelectMode && (
              <Button onClick={() => navigate(routes.home)} variant="primary" size="sm">
                <FaPlus className="w-3.5 h-3.5" />
                <span>New URL</span>
              </Button>
            )}
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

      {pageError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-900/15 px-4 py-3 text-sm text-red-300">
          {pageError}
        </div>
      )}

      {displayMappings.length > 0 ? (
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {displayMappings.map((mapping, index) => (
            <UrlMappingCard
              key={mapping.urlHash}
              mapping={mapping}
              index={displayPage * PAGE_SIZE + index + 1}
              onCopy={handleCopyUrl}
              copiedUrl={copiedUrl}
              onDetails={() => navigate(routes.urlDetails(mapping.urlHash))}
              onDelete={() => setPendingDeleteHash(mapping.urlHash)}
              isDeleting={deletingHash === mapping.urlHash}
              formatDate={formatUrlDate}
              isSelectMode={isSelectMode}
              isSelected={selectedHashes.has(mapping.urlHash)}
              onToggleSelect={() => toggleSelect(mapping.urlHash)}
            />
          ))}
        </div>
      ) : isSearchMode ? (
        <div className="flex flex-1 items-start justify-center pt-4 sm:items-center sm:pt-0">
          <div className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] px-6 py-14 text-center sm:max-w-md">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04]">
              <FaSearch className="h-5 w-5 text-white/15" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">No results</h3>
            <p className="mb-6 text-sm leading-relaxed text-white/35">
              No URLs match "<span className="text-white/55">{search}</span>"
            </p>
            <Button onClick={() => setSearch('')} variant="secondary" size="sm" className="mx-auto">
              <FaTimes className="w-3.5 h-3.5" />
              Clear search
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-start justify-center pt-4 sm:items-center sm:pt-0">
          <div className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] px-6 py-14 text-center sm:max-w-md">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04]">
              <FaLink className="h-5 w-5 text-white/15" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">No URLs yet</h3>
            <p className="mb-6 text-sm leading-relaxed text-white/35">
              Shorten your first link and start tracking clicks.
            </p>
            <Button onClick={() => navigate(routes.home)} size="sm" className="mx-auto">
              <FaPlus className="w-3.5 h-3.5" />
              Create Short URL
            </Button>
          </div>
        </div>
      )}

      {displayTotalPages > 1 && (
        <UrlMappingsPagination
          page={displayPage}
          total={displayTotal}
          totalPages={displayTotalPages}
          onPageChange={handlePageChange}
        />
      )}

      {isSelectMode && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/[0.10] bg-[#0d0f1e]/90 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          style={{ animation: 'modal-in 0.2s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <span className="min-w-[90px] text-sm font-medium text-white/55">
            {selectedHashes.size > 0
              ? `${selectedHashes.size} selected`
              : 'Select URLs'}
          </span>

          <div className="mx-1 h-4 w-px bg-white/[0.1]" />

          <button
            onClick={toggleSelectAll}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
          >
            {isAllSelected ? 'Deselect all' : 'Select all'}
          </button>

          <Button
            variant="danger"
            size="sm"
            disabled={selectedHashes.size === 0}
            onClick={() => setShowBulkConfirm(true)}
          >
            <FaTrash className="h-3 w-3" />
            Delete {selectedHashes.size > 0 ? selectedHashes.size : ''}
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={pendingDeleteHash !== null}
        title="Delete URL?"
        message="This short link will stop working immediately and cannot be restored."
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
        onConfirm={() => void handleBulkDelete().then(() => setShowBulkConfirm(false))}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </AccountPageLayout>
  );
};

export default UserUrlMappingsPage;
