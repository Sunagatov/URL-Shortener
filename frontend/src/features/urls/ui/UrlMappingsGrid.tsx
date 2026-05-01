import { formatUrlDate } from '@/features/urls/lib/urlMappings';
import type { UrlMapping } from '@/features/urls/types/url';
import { UrlMappingCard } from '@/features/urls/ui/UrlMappingCard';

type UrlMappingsGridProps = {
  copiedUrl: string | null;
  deletingHash: string | null;
  isSelectMode: boolean;
  mappings: UrlMapping[];
  selectedHashes: Set<string>;
  onCopy: (url: string) => Promise<void>;
  onDelete: (urlHash: string) => void;
  onDetails: (urlHash: string) => void;
  onToggleSelect: (urlHash: string) => void;
};

export function UrlMappingsGrid({
  copiedUrl,
  deletingHash,
  isSelectMode,
  mappings,
  selectedHashes,
  onCopy,
  onDelete,
  onDetails,
  onToggleSelect,
}: UrlMappingsGridProps) {
  return (
    <>
      <style>{`
        @keyframes urlCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {mappings.map((mapping, index) => (
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
              onCopy={onCopy}
              onDelete={() => onDelete(mapping.urlHash)}
              onDetails={() => onDetails(mapping.urlHash)}
              onToggleSelect={() => onToggleSelect(mapping.urlHash)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
