import { FaTrash } from 'react-icons/fa';
import { Button } from '@/shared/ui';

interface UrlMappingsSelectionBarProps {
  isAllSelected: boolean;
  onDelete: () => void;
  onToggleSelectAll: () => void;
  selectedCount: number;
}

export function UrlMappingsSelectionBar({
  isAllSelected,
  onDelete,
  onToggleSelectAll,
  selectedCount,
}: UrlMappingsSelectionBarProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/[0.10] bg-[#0d0f1e]/90 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      style={{ animation: 'modal-in 0.2s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <span className="min-w-[90px] text-sm font-medium text-white/55">
        {selectedCount > 0 ? `${selectedCount} selected` : 'Select URLs'}
      </span>

      <div className="mx-1 h-4 w-px bg-white/[0.1]" />

      <button
        onClick={onToggleSelectAll}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
      >
        {isAllSelected ? 'Deselect all' : 'Select all'}
      </button>

      <Button variant="danger" size="sm" disabled={selectedCount === 0} onClick={onDelete}>
        <FaTrash className="h-3 w-3" />
        Delete {selectedCount > 0 ? selectedCount : ''}
      </Button>
    </div>
  );
}
