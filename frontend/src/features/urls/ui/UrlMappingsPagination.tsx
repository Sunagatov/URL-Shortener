import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getVisiblePages, PAGE_SIZE } from '@/features/urls/lib/urlMappings';
import { Button } from '@/shared/ui';

interface UrlMappingsPaginationProps {
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const UrlMappingsPagination = ({
  page,
  total,
  totalPages,
  onPageChange,
}: UrlMappingsPaginationProps) => {
  return (
    <div className="mt-auto flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-5 py-4 sm:flex-row">
      <p className="text-xs text-white/35">
        Showing{' '}
        <span className="font-semibold text-white">
          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)}
        </span>{' '}
        of <span className="font-semibold text-white">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          variant="secondary"
          size="sm"
        >
          <FaChevronLeft className="h-3 w-3" />
        </Button>
        {getVisiblePages(page, totalPages).map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
              pageNumber === page
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'bg-white/[0.06] text-white/45 hover:bg-white/[0.10] hover:text-white'
            }`}
          >
            {pageNumber + 1}
          </button>
        ))}
        <Button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          variant="secondary"
          size="sm"
        >
          <FaChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
