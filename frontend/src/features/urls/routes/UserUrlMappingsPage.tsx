import React from 'react';
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
import { Button } from '@/shared/ui';
import { FaLink, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';

const UserUrlMappingsPage: React.FC = () => {
  usePageTitle('My URLs');
  const navigate = useNavigate();
  const {
    copiedUrl,
    deletingHash,
    displayMappings,
    displayPage,
    displayTotal,
    displayTotalPages,
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
  } = useUserUrlMappings();

  if (isLoading) {
    return <AccountPageLoadingState message="Loading your URLs…" />;
  }

  return (
    <AccountPageLayout contentClassName="mx-auto flex min-h-full max-w-6xl flex-col">
      <AccountPageHeader
        title="My URLs"
        description="Manage and track your shortened links"
        actions={
          <Button onClick={() => navigate(routes.home)} variant="primary" size="sm">
            <FaPlus className="w-3.5 h-3.5" />
            <span>New URL</span>
          </Button>
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
              onDelete={() => handleDeleteMapping(mapping.urlHash)}
              isDeleting={deletingHash === mapping.urlHash}
              formatDate={formatUrlDate}
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
    </AccountPageLayout>
  );
};

export default UserUrlMappingsPage;
