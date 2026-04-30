import type { MouseEvent } from 'react';
import { useState } from 'react';
import { FaCheck, FaChevronRight, FaCopy, FaExternalLinkAlt, FaLink, FaTrash } from 'react-icons/fa';
import { getDomainLabel, getShortUrlSlug } from '@/features/urls/lib/urlMappings';
import type { UrlMapping } from '@/shared/types';
import { Button } from '@/shared/ui';

interface UrlMappingCardProps {
  copiedUrl: string | null;
  formatDate: (date: string) => string;
  index: number;
  isDeleting: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  mapping: UrlMapping;
  onCopy: (url: string) => void;
  onDelete: () => void;
  onDetails: () => void;
  onToggleSelect?: () => void;
}

const FaviconImage = ({ domain }: { domain: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <FaLink className="h-3.5 w-3.5 text-blue-400" />;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      width={16}
      height={16}
      onError={() => setFailed(true)}
      className="h-4 w-4 object-contain"
    />
  );
};

export const UrlMappingCard = ({
  copiedUrl,
  formatDate,
  index,
  isDeleting,
  isSelectMode = false,
  isSelected = false,
  mapping,
  onCopy,
  onDelete,
  onDetails,
  onToggleSelect,
}: UrlMappingCardProps) => {
  const domain = getDomainLabel(mapping.originalUrl);
  const shortSlug = getShortUrlSlug(mapping.shortUrl);
  const clickCountLabel = `${mapping.clickCount} ${mapping.clickCount === 1 ? 'click' : 'clicks'}`;

  const stopPropagation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleCardClick = isSelectMode ? onToggleSelect : onDetails;

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 ${
        isSelectMode && isSelected
          ? 'border-blue-500/50 bg-blue-900/10 ring-1 ring-blue-500/30'
          : 'border-white/[0.07] bg-white/[0.04] hover:border-blue-500/25 hover:bg-white/[0.055]'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
        {isSelectMode ? (
          <div
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
              isSelected ? 'border-blue-500 bg-blue-500' : 'border-white/25 bg-transparent'
            }`}
          >
            {isSelected && <FaCheck className="h-2.5 w-2.5 text-white" />}
          </div>
        ) : (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-600/15">
            <FaviconImage domain={domain} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/50">#{index}</span>
            <span className="text-xs text-white/25">·</span>
            <span className="truncate text-xs text-white/45">{domain}</span>
          </div>
          <p className="mt-0.5 text-xs text-white/25">{formatDate(mapping.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
            {clickCountLabel}
          </span>
          {!isSelectMode && (
            <>
              <a
                href={mapping.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="rounded-lg p-2 text-white/30 transition-all hover:bg-blue-500/10 hover:text-blue-300"
                title="Open short URL"
                aria-label={`Open short URL ${mapping.shortUrl}`}
              >
                <FaExternalLinkAlt className="h-3 w-3" />
              </a>
              <FaChevronRight className="h-3 w-3 flex-shrink-0 text-white/15 transition-colors group-hover:text-white/40" />
            </>
          )}
        </div>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Short URL
          </p>
          <div className="group/row flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0a1220] px-3 py-2.5 transition-colors hover:border-blue-500/20">
            <span
              className="flex-1 truncate text-sm text-blue-400"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            >
              …/{shortSlug}
            </span>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
              <button
                onClick={event => {
                  stopPropagation(event);
                  void onCopy(mapping.shortUrl);
                }}
                className="rounded-lg p-1.5 text-white/30 transition-all hover:bg-blue-500/10 hover:text-blue-300"
                title="Copy"
              >
                {copiedUrl === mapping.shortUrl ? (
                  <FaCheck className="h-3 w-3 text-blue-400" />
                ) : (
                  <FaCopy className="h-3 w-3" />
                )}
              </button>
              <a
                href={mapping.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="rounded-lg p-1.5 text-white/30 transition-all hover:bg-blue-500/10 hover:text-blue-300"
                title="Open"
              >
                <FaExternalLinkAlt className="h-3 w-3" />
              </a>
            </div>
            {copiedUrl === mapping.shortUrl && (
              <span
                className="max-w-[8.5rem] shrink truncate text-[10px] font-medium text-blue-400 sm:max-w-[12rem]"
                title={`${mapping.shortUrl} copied!`}
              >
                {mapping.shortUrl} copied!
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Original URL
          </p>
          <div className="group/row flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-white/[0.10]">
            <span
              className="flex-1 truncate text-xs text-white/45"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}
              title={mapping.originalUrl}
            >
              {mapping.originalUrl}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
              <button
                onClick={event => {
                  stopPropagation(event);
                  void onCopy(mapping.originalUrl);
                }}
                className="rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/5 hover:text-white/60"
                title="Copy"
              >
                <FaCopy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {mapping.expirationDate && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-900/15 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/60">
              Expires
            </span>
            <span
              className="ml-auto text-xs text-amber-300/70"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
            >
              {formatDate(mapping.expirationDate)}
            </span>
          </div>
        )}
      </div>

      {!isSelectMode && (
        <div className="flex justify-end border-t border-white/[0.06] bg-white/[0.02] px-5 py-3">
          <Button
            onClick={event => {
              stopPropagation(event);
              void onDelete();
            }}
            variant="secondary"
            size="sm"
            title="Delete URL"
            loading={isDeleting}
            className="text-red-400/40 hover:border-red-500/20 hover:bg-red-900/20 hover:text-red-300"
          >
            {!isDeleting && <FaTrash className="h-3 w-3" />}
            <span>{isDeleting ? 'Deleting…' : 'Delete'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
