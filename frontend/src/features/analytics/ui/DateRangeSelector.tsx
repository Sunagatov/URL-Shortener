import { FaCalendarAlt } from 'react-icons/fa';

interface DateRangeSelectorProps {
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
}

const PRESETS = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const;

function getActiveDays(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
}

export function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps) {
  const activeDays = getActiveDays(dateRange.from, dateRange.to);

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    onDateRangeChange({ from: from.toISOString(), to: to.toISOString() });
  };

  return (
    <div className="flex items-center gap-2">
      <FaCalendarAlt className="h-3 w-3 text-[color:var(--text-muted)]" />
      <div className="flex gap-1">
        {PRESETS.map(({ label, days }) => (
          <button
            key={label}
            onClick={() => handlePreset(days)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              activeDays === days
                ? 'bg-[var(--badge-bg)] text-[color:var(--avatar-text)]'
                : 'text-[color:var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[color:var(--text-secondary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
