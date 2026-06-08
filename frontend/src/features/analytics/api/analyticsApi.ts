import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';
import type {
  AnalyticsSummary,
  AnalyticsTimeseries,
  AnalyticsBreakdown,
  AnalyticsTopLinks,
  AnalyticsParams,
} from '@/features/analytics/types/analytics';

function buildParams(params: AnalyticsParams) {
  return {
    from: params.from,
    to: params.to,
    timezone: params.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    includeBots: params.includeBots ?? false,
    limit: params.limit,
    eventType: params.eventType,
  };
}

export async function getUrlSummary(
  hash: string,
  params: AnalyticsParams = {}
): Promise<AnalyticsSummary> {
  const response = await httpClient.get(endpoints.urls.analytics.summary(hash), {
    params: buildParams(params),
  });
  return response.data;
}

export async function getUrlTimeseries(
  hash: string,
  params: AnalyticsParams = {}
): Promise<AnalyticsTimeseries> {
  const response = await httpClient.get(endpoints.urls.analytics.timeseries(hash), {
    params: buildParams(params),
  });
  return response.data;
}

export async function getUrlBreakdown(
  hash: string,
  dimension: string,
  params: AnalyticsParams = {}
): Promise<AnalyticsBreakdown> {
  const response = await httpClient.get(endpoints.urls.analytics.breakdown(hash, dimension), {
    params: buildParams(params),
  });
  return response.data;
}

export async function getAccountSummary(params: AnalyticsParams = {}): Promise<AnalyticsSummary> {
  const response = await httpClient.get(endpoints.analytics.summary, {
    params: buildParams(params),
  });
  return response.data;
}

export async function getAccountTimeseries(
  params: AnalyticsParams = {}
): Promise<AnalyticsTimeseries> {
  const response = await httpClient.get(endpoints.analytics.timeseries, {
    params: buildParams(params),
  });
  return response.data;
}

export async function getAccountTopLinks(params: AnalyticsParams = {}): Promise<AnalyticsTopLinks> {
  const response = await httpClient.get(endpoints.analytics.topLinks, {
    params: buildParams(params),
  });
  return response.data;
}

export async function getAccountBreakdown(
  dimension: string,
  params: AnalyticsParams = {}
): Promise<AnalyticsBreakdown> {
  const response = await httpClient.get(endpoints.analytics.breakdown(dimension), {
    params: buildParams(params),
  });
  return response.data;
}
