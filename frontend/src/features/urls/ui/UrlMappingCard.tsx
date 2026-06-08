import type { MouseEvent } from 'react';
import { useState } from 'react';
import { FaCheck, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import { getDomainLabel } from '@/features/urls/lib/urlMappings';
import type { UrlMapping } from '@/features/urls/types/url';
import { UrlFallbackIcon, UrlFavicon } from '@/features/urls/ui/UrlSurfacePrimitives';
import { UrlValueField } from '@/features/urls/ui/UrlValueField';
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
      className={`group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 ${
        isSelectMode && isSelected
          ? 'border-blue-500/50 bg-blue-900/10 ring-1 ring-blue-500/30'
          : 'border-[color:var(--card-border)] bg-[var(--card-bg)] hover:border-blue-500/25 hover:bg-[var(--surface-hover)]'
      }`}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-3.5">
        <button
          type="button"
          aria-label={
            isSelectMode ? `Toggle selection for ${domain}` : `Open details for ${domain}`
          }
          aria-pressed={isSelectMode ? isSelected : undefined}
          onClick={handleCardClick}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {isSelectMode ? (
            <span
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                isSelected
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-[color:var(--text-muted)] bg-transparent'
              }`}
            >
              {isSelected && <FaCheck className="h-2.5 w-2.5 text-[color:var(--text-on-accent)]" />}
            </span>
          ) : (
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-[color:var(--avatar-border)] bg-[var(--avatar-bg)]">
              <FaviconImage domain={domain} />
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-[color:var(--text-secondary)]">
              {domain}
            </span>
            <span className="mt-0.5 block text-xs text-[color:var(--text-muted)]">
              {formatDate(mapping.createdAt)}
            </span>
          </span>
        </button>

        {/* Click count + sparkbar + actions */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-1.5">
            <span className="rounded-full border border-[color:var(--border)] bg-[var(--card-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
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
                  className="rounded-lg p-2 text-[color:var(--text-muted)] transition-all hover:bg-[var(--badge-bg)] hover:text-[color:var(--avatar-text)]"
                  aria-label={`Open short URL ${mapping.shortUrl}`}
                >
                  <FaExternalLinkAlt className="h-3 w-3" />
                </a>
              </Tooltip>
              <Tooltip content="Delete URL">
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    onDelete();
                  }}
                  disabled={isDeleting}
                  className="rounded-lg p-2 text-[color:var(--danger-text)] transition-all hover:bg-[var(--danger-bg)] hover:text-[color:var(--danger-text)] disabled:opacity-40"
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
        <div onClick={stopPropagation}>
          <UrlValueField
            copyValue={mapping.shortUrl}
            copiedValue={copiedUrl}
            displayValue={shortDisplay}
            href={mapping.shortUrl}
            label="Short URL"
            onCopy={onCopy}
            tone="primary"
            value={mapping.shortUrl}
            valueClassName="text-sm"
            valueLabel={mapping.shortUrl}
          />
        </div>

        <div onClick={stopPropagation}>
          <UrlValueField
            copiedValue={copiedUrl}
            label="Original URL"
            onCopy={onCopy}
            value={mapping.originalUrl}
            valueClassName="text-xs"
            valueLabel={mapping.originalUrl}
          />
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
