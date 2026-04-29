import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaTimes } from 'react-icons/fa';

interface UrlMappingsToolbarProps {
  displayTotal: number;
  isSearchMode: boolean;
  search: string;
  sortOrder: 'newest' | 'oldest';
  totalElements: number;
  onClearSearch: () => void;
  onSearchChange: (value: string) => void;
  onToggleSortOrder: () => void;
}

export const UrlMappingsToolbar = ({
  displayTotal,
  isSearchMode,
  search,
  sortOrder,
  totalElements,
  onClearSearch,
  onSearchChange,
  onToggleSortOrder,
}: UrlMappingsToolbarProps) => {
  return (
    <div className="mb-6 flex flex-col gap-2.5 sm:flex-row">
      <div className="relative flex-1">
        <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
        <input
          type="text"
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Search by original or short URL…"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/25 transition-all focus:border-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        {search && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <button
        onClick={onToggleSortOrder}
        className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white/55 transition-all hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/80"
      >
        {sortOrder === 'newest' ? (
          <FaSortAmountDown className="h-3.5 w-3.5" />
        ) : (
          <FaSortAmountUp className="h-3.5 w-3.5" />
        )}
        {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
      </button>

      {displayTotal > 0 && (
        <div className="flex items-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
          <span className="whitespace-nowrap text-xs text-white/35">
            {isSearchMode
              ? `${displayTotal} result${displayTotal !== 1 ? 's' : ''}`
              : `${totalElements} link${totalElements !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}
    </div>
  );
};
