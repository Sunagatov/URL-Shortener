import { FaExternalLinkAlt } from 'react-icons/fa';
import type { AnalyticsTopLinks } from '@/features/analytics/types/analytics';

interface TopLinksTableProps {
  topLinks: AnalyticsTopLinks;
}

export function TopLinksTable({ topLinks }: TopLinksTableProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]">
      <div className="border-b border-[color:var(--border)] px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
          Top Performing Links
        </p>
      </div>
      <div className="p-5">
        {topLinks.items.length === 0 ? (
          <p className="text-sm text-[color:var(--text-muted)]">No link data for this period</p>
        ) : (
          <div className="space-y-3">
            {topLinks.items.map((item, i) => (
              <div
                key={item.urlHash}
                className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] p-3"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-[10px] font-bold text-[color:var(--avatar-text)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[color:var(--text-secondary)]">
                    {item.originalUrl}
                  </p>
                  <p
                    className="truncate text-[10px] text-[color:var(--text-muted)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    /{item.urlHash}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 text-sm font-bold text-[color:var(--text-primary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {item.clicksInRange.toLocaleString()}
                </span>
                <a
                  href={item.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-lg p-1.5 text-[color:var(--text-muted)] transition-all hover:bg-[var(--surface-hover)] hover:text-[color:var(--text-secondary)]"
                  aria-label={`Open ${item.urlHash}`}
                >
                  <FaExternalLinkAlt className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
