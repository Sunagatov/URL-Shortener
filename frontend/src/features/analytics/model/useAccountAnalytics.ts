import { useCallback, useEffect, useState } from 'react';
import type {
  AnalyticsSummary,
  AnalyticsTimeseries,
  AnalyticsBreakdown,
  AnalyticsTopLinks,
  AnalyticsParams,
} from '@/features/analytics/types/analytics';
import {
  getAccountSummary,
  getAccountTimeseries,
  getAccountTopLinks,
  getAccountBreakdown,
} from '@/features/analytics/api/analyticsApi';

interface AccountAnalyticsState {
  summary: AnalyticsSummary | null;
  timeseries: AnalyticsTimeseries | null;
  topLinks: AnalyticsTopLinks | null;
  breakdowns: Record<string, AnalyticsBreakdown>;
  loading: boolean;
  error: string | null;
}

const DIMENSIONS = ['referrers', 'locations', 'devices', 'browsers', 'operating-systems'] as const;

export function useAccountAnalytics() {
  const [state, setState] = useState<AccountAnalyticsState>({
    summary: null,
    timeseries: null,
    topLinks: null,
    breakdowns: {},
    loading: false,
    error: null,
  });
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  });
  const [eventType, setEventType] = useState<string | undefined>(undefined);

  const fetchAnalytics = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const params: AnalyticsParams = { from: dateRange.from, to: dateRange.to, eventType };

    try {
      const [summary, timeseries, topLinks, ...breakdownResults] = await Promise.all([
        getAccountSummary(params),
        getAccountTimeseries(params),
        getAccountTopLinks(params),
        ...DIMENSIONS.map(d => getAccountBreakdown(d, params)),
      ]);

      const breakdowns: Record<string, AnalyticsBreakdown> = {};
      DIMENSIONS.forEach((d, i) => {
        breakdowns[d] = breakdownResults[i];
      });

      setState({ summary, timeseries, topLinks, breakdowns, loading: false, error: null });
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load analytics' }));
    }
  }, [dateRange, eventType]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  return { ...state, dateRange, setDateRange, eventType, setEventType, refresh: fetchAnalytics };
}
