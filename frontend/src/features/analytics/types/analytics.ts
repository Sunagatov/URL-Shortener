export interface AnalyticsDateRange {
  from: string;
  to: string;
  timezone: string;
}

export interface AnalyticsMetrics {
  totalClicks: number;
  clicksInRange: number;
  previousPeriodClicks: number;
  changeAbsolute: number;
  changePercent: number | null;
  estimatedUniqueVisitors: number | null;
}

export interface AnalyticsFilters {
  eventType: string | null;
  includeBots: boolean;
}

export interface AnalyticsSummary {
  urlHash: string | null;
  selectedRange: AnalyticsDateRange;
  metrics: AnalyticsMetrics;
  filters: AnalyticsFilters;
}

export interface TimeseriesPoint {
  timestamp: string;
  count: number;
}

export interface AnalyticsTimeseries {
  urlHash: string | null;
  bucket: string;
  points: TimeseriesPoint[];
}

export interface BreakdownItem {
  label: string;
  count: number;
  percentage: number;
}

export interface AnalyticsBreakdown {
  dimension: string;
  items: BreakdownItem[];
}

export interface TopLinkItem {
  urlHash: string;
  shortUrl: string;
  originalUrl: string;
  clicksInRange: number;
}

export interface AnalyticsTopLinks {
  items: TopLinkItem[];
}

export interface AnalyticsParams {
  from?: string;
  to?: string;
  timezone?: string;
  includeBots?: boolean;
  limit?: number;
  eventType?: string;
}
