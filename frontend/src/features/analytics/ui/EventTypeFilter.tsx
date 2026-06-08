interface EventTypeFilterProps {
  value: string | undefined;
  onChange: (eventType: string | undefined) => void;
}

const OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Link Clicks', value: 'LINK_CLICK' },
  { label: 'QR Scans', value: 'QR_SCAN' },
] as const;

export function EventTypeFilter({ value, onChange }: EventTypeFilterProps) {
  return (
    <div className="flex gap-1 rounded-xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-1">
      {OPTIONS.map(opt => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
            value === opt.value
              ? 'bg-[var(--badge-bg)] text-[color:var(--avatar-text)]'
              : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
