import { useCallback, useEffect, useState } from 'react';
import type {
  AnalyticsSummary,
  AnalyticsTimeseries,
  AnalyticsBreakdown,
  AnalyticsParams,
} from '@/features/analytics/types/analytics';
import {
  getUrlSummary,
  getUrlTimeseries,
  getUrlBreakdown,
} from '@/features/analytics/api/analyticsApi';

interface UrlAnalyticsState {
  summary: AnalyticsSummary | null;
  timeseries: AnalyticsTimeseries | null;
  breakdowns: Record<string, AnalyticsBreakdown>;
  loading: boolean;
  error: string | null;
}

const DIMENSIONS = ['referrers', 'locations', 'devices', 'browsers', 'operating-systems'] as const;

export function useUrlAnalytics(urlHash: string | undefined) {
  const [state, setState] = useState<UrlAnalyticsState>({
    summary: null,
    timeseries: null,
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
    if (!urlHash) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    const params: AnalyticsParams = { from: dateRange.from, to: dateRange.to, eventType };

    try {
      const [summary, timeseries, ...breakdownResults] = await Promise.all([
        getUrlSummary(urlHash, params),
        getUrlTimeseries(urlHash, params),
        ...DIMENSIONS.map(d => getUrlBreakdown(urlHash, d, params)),
      ]);

      const breakdowns: Record<string, AnalyticsBreakdown> = {};
      DIMENSIONS.forEach((d, i) => { breakdowns[d] = breakdownResults[i]; });

      setState({ summary, timeseries, breakdowns, loading: false, error: null });
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load analytics' }));
    }
  }, [urlHash, dateRange, eventType]);

  useEffect(() => { void fetchAnalytics(); }, [fetchAnalytics]);

  return { ...state, dateRange, setDateRange, eventType, setEventType, refresh: fetchAnalytics };
}
