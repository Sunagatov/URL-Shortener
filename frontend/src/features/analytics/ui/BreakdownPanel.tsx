import type { AnalyticsBreakdown } from '@/features/analytics/types/analytics';

interface BreakdownPanelProps {
  breakdown: AnalyticsBreakdown;
  title: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  referrers: 'Top Referrers',
  locations: 'Top Locations',
  devices: 'Devices',
  browsers: 'Browsers',
  'operating-systems': 'Operating Systems',
};

export function BreakdownPanel({ breakdown, title }: BreakdownPanelProps) {
  const label = DIMENSION_LABELS[breakdown.dimension] ?? title;

  return (
    <div className="rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]">
      <div className="border-b border-[color:var(--border)] px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
          {label}
        </p>
      </div>
      <div className="p-5">
        {breakdown.items.length === 0 ? (
          <p className="text-sm text-[color:var(--text-muted)]">No data</p>
        ) : (
          <div className="space-y-3">
            {breakdown.items.map(item => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-[color:var(--text-secondary)]">
                    {item.label}
                  </span>
                  <span
                    className="text-xs text-[color:var(--text-muted)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full bg-blue-500/60 transition-all"
                    style={{ width: `${Math.max(item.percentage, 1)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BreakdownGridProps {
  breakdowns: Record<string, AnalyticsBreakdown>;
}

export function BreakdownGrid({ breakdowns }: BreakdownGridProps) {
  const dimensions = Object.keys(breakdowns);
  if (dimensions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dimensions.map(dim => (
        <BreakdownPanel key={dim} breakdown={breakdowns[dim]} title={dim} />
      ))}
    </div>
  );
}
