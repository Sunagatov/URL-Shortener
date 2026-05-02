import React from 'react';
import { AccountPageHeader, AccountPageLayout } from '@/features/account/ui/layout/AccountPageLayout';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { useAccountAnalytics } from '@/features/analytics/model/useAccountAnalytics';
import { DateRangeSelector } from '@/features/analytics/ui/DateRangeSelector';
import { SummaryCards } from '@/features/analytics/ui/SummaryCards';
import { TimeseriesChart } from '@/features/analytics/ui/TimeseriesChart';
import { BreakdownGrid } from '@/features/analytics/ui/BreakdownPanel';
import { TopLinksTable } from '@/features/analytics/ui/TopLinksTable';
import { AnalyticsLoadingSkeleton } from '@/features/analytics/ui/AnalyticsLoadingSkeleton';
import { EventTypeFilter } from '@/features/analytics/ui/EventTypeFilter';

const AccountAnalyticsPage: React.FC = () => {
  usePageTitle('Analytics');
  const analytics = useAccountAnalytics();

  return (
    <AccountPageLayout contentClassName="mx-auto max-w-5xl">
      <AccountPageHeader
        title="Analytics"
        description="Traffic insights across all your links"
        actions={
          <div className="flex items-center gap-2">
            <EventTypeFilter value={analytics.eventType} onChange={analytics.setEventType} />
            <DateRangeSelector dateRange={analytics.dateRange} onDateRangeChange={analytics.setDateRange} />
          </div>
        }
      />

      <p className="mb-4 -mt-4 text-[10px] text-[color:var(--text-muted)]">Bot traffic excluded from analytics</p>

      {analytics.loading ? (
        <AnalyticsLoadingSkeleton />
      ) : analytics.error ? (
        <div className="rounded-2xl border border-[color:var(--danger)] bg-[var(--danger-bg)] p-6 text-center">
          <p className="text-sm text-red-300">{analytics.error}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {analytics.summary && <SummaryCards summary={analytics.summary} />}
          {analytics.timeseries && <TimeseriesChart timeseries={analytics.timeseries} />}
          {analytics.topLinks && <TopLinksTable topLinks={analytics.topLinks} />}
          <BreakdownGrid breakdowns={analytics.breakdowns} />
        </div>
      )}
    </AccountPageLayout>
  );
};

export default AccountAnalyticsPage;
