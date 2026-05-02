export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]">
            <div className="skeleton h-full w-full rounded-2xl" />
          </div>
        ))}
      </div>
      <div className="h-64 rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]">
        <div className="skeleton h-full w-full rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]">
            <div className="skeleton h-full w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
