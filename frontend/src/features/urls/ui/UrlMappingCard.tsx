import type { MouseEvent } from 'react';
import { useState } from 'react';
import { FaCheck, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import { getDomainLabel } from '@/features/urls/lib/urlMappings';
import type { UrlMapping } from '@/features/urls/types/url';
import {
  UrlCopyButton,
  UrlExternalLinkButton,
  UrlFallbackIcon,
  UrlFieldLabel,
  UrlFavicon,
} from '@/features/urls/ui/UrlSurfacePrimitives';
import { Tooltip } from '@/shared/ui';

interface UrlMappingCardProps {
  copiedUrl: string | null;
  formatDate: (date: string) => string;
  isDeleting: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  mapping: UrlMapping;
  onCopy: (url: string) => void;
  onDelete: () => void;
  onDetails: () => void;
  onToggleSelect?: () => void;
}

function getSparkHeights(urlHash: string): number[] {
  return Array.from({ length: 6 }, (_, i) => {
    const code = urlHash.charCodeAt(i % urlHash.length);
    return 2 + (code % 9); // 2–10 px, deterministic per URL
  });
}

const FaviconImage = ({ domain }: { domain: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <UrlFallbackIcon />;
  return <UrlFavicon domain={domain} onError={() => setFailed(true)} />;
};

export const UrlMappingCard = ({
  copiedUrl,
  formatDate,
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
  const shortDisplay = mapping.shortUrl.replace(/^https?:\/\//, '');
  const clickCountLabel = `${mapping.clickCount} ${mapping.clickCount === 1 ? 'click' : 'clicks'}`;
  const sparkHeights = getSparkHeights(mapping.urlHash);

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();
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
      {/* ── Header ─────────────────────────────────────────── */}
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
          <span className="truncate text-xs font-medium text-white/50">{domain}</span>
          <p className="mt-0.5 text-xs text-white/25">{formatDate(mapping.createdAt)}</p>
        </div>

        {/* Click count + sparkbar + actions */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-1.5">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              {clickCountLabel}
            </span>
            <div className="flex items-end gap-[2px]" style={{ height: '10px' }}>
              {sparkHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm bg-blue-400/30"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>

          {!isSelectMode && (
            <>
              <Tooltip content="Open short URL">
                <a
                  href={mapping.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stopPropagation}
                  className="rounded-lg p-2 text-white/30 transition-all hover:bg-blue-500/10 hover:text-blue-300"
                  aria-label={`Open short URL ${mapping.shortUrl}`}
                >
                  <FaExternalLinkAlt className="h-3 w-3" />
                </a>
              </Tooltip>
              <Tooltip content="Delete URL">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                  disabled={isDeleting}
                  className="rounded-lg p-2 text-red-400/70 transition-all hover:bg-red-900/20 hover:text-red-300 disabled:opacity-40"
                  aria-label="Delete URL"
                  title="Delete URL"
                >
                  <FaTrash className="h-3 w-3" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="space-y-3 px-5 py-4">
        <div>
          <UrlFieldLabel>Short URL</UrlFieldLabel>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0a1220] px-3 py-2.5 transition-colors hover:border-blue-500/20">
            <span
              className="flex-1 truncate text-sm text-blue-400"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            >
              {shortDisplay}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <span onClick={stopPropagation}>
                <UrlCopyButton
                  copied={copiedUrl === mapping.shortUrl}
                  onCopy={() => { void onCopy(mapping.shortUrl); }}
                  primary
                />
              </span>
              <UrlExternalLinkButton
                href={mapping.shortUrl}
                onClick={stopPropagation}
                primary
                title="Open"
              />
            </div>
            {copiedUrl === mapping.shortUrl && (
              <Tooltip content={`${mapping.shortUrl} copied!`}>
                <span className="max-w-[8.5rem] shrink truncate text-[10px] font-medium text-blue-400 sm:max-w-[12rem]">
                  {mapping.shortUrl} copied!
                </span>
              </Tooltip>
            )}
          </div>
        </div>

        <div>
          <UrlFieldLabel>Original URL</UrlFieldLabel>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-white/[0.10]">
            <span
              className="flex-1 truncate text-xs text-white/45"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}
              aria-label={mapping.originalUrl}
            >
              {mapping.originalUrl}
            </span>
            <div className="shrink-0">
              <span onClick={stopPropagation}>
                <UrlCopyButton
                  copied={copiedUrl === mapping.originalUrl}
                  onCopy={() => { void onCopy(mapping.originalUrl); }}
                  title="Copy"
                />
              </span>
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
    </div>
  );
};
