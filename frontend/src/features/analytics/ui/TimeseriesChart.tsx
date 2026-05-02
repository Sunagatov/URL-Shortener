import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AnalyticsTimeseries } from '@/features/analytics/types/analytics';

interface TimeseriesChartProps {
  timeseries: AnalyticsTimeseries;
}

function formatLabel(timestamp: string, bucket: string): string {
  const date = new Date(timestamp);
  if (bucket === 'hour') return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TimeseriesChart({ timeseries }: TimeseriesChartProps) {
  const data = timeseries.points.map(p => ({
    label: formatLabel(p.timestamp, timeseries.bucket),
    count: p.count,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]">
        <p className="text-sm text-[color:var(--text-muted)]">No click data for this period</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-5">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">Clicks Over Time</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#fff' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
          />
          <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#clickGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
