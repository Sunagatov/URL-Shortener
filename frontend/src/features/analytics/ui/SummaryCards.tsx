import { FaArrowDown, FaArrowUp, FaChartLine, FaMinus, FaMousePointer, FaUsers } from 'react-icons/fa';
import type { AnalyticsSummary } from '@/features/analytics/types/analytics';

interface SummaryCardsProps {
  summary: AnalyticsSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const { metrics } = summary;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <SummaryCard label="Total Clicks" value={metrics.totalClicks} icon={<FaMousePointer className="h-3.5 w-3.5 text-[color:var(--avatar-text)]" />} />
      <SummaryCard label="In Range" value={metrics.clicksInRange} icon={<FaChartLine className="h-3.5 w-3.5 text-[color:var(--accent)]" />} />
      <SummaryCard label="Unique Visitors" value={metrics.estimatedUniqueVisitors ?? 0} icon={<FaUsers className="h-3.5 w-3.5 text-violet-400" />} subtitle="≈ estimated" />
      <SummaryCard label="Previous Period" value={metrics.previousPeriodClicks} icon={<FaChartLine className="h-3.5 w-3.5 text-[color:var(--text-muted)]" />} />
      <ChangeCard changeAbsolute={metrics.changeAbsolute} changePercent={metrics.changePercent} />
    </div>
  );
}

function SummaryCard({ label, value, icon, subtitle }: { label: string; value: number; icon: React.ReactNode; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[var(--card-bg)]">
          {icon}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[color:var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
        {value.toLocaleString()}
      </p>
      {subtitle && <p className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">{subtitle}</p>}
    </div>
  );
}

function ChangeCard({ changeAbsolute, changePercent }: { changeAbsolute: number; changePercent: number | null }) {
  const isPositive = changeAbsolute > 0;
  const isNegative = changeAbsolute < 0;

  const toneClass = isPositive
    ? 'text-emerald-400'
    : isNegative
      ? 'text-red-400'
      : 'text-[color:var(--text-muted)]';

  const ChangeIcon = isPositive ? FaArrowUp : isNegative ? FaArrowDown : FaMinus;

  return (
    <div className="rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[var(--card-bg)]">
          <ChangeIcon className={`h-3.5 w-3.5 ${toneClass}`} />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">Change</p>
      </div>
      <p className={`text-2xl font-bold ${toneClass}`} style={{ fontFamily: 'var(--font-display)' }}>
        {changePercent !== null ? `${changePercent > 0 ? '+' : ''}${changePercent}%` : '—'}
      </p>
    </div>
  );
}
