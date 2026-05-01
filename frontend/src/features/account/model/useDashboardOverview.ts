import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatUrlDate,
  getDomainLabel,
  getShortUrlSlug,
} from '@/features/urls/lib/urlMappings';
import { getUserUrlsUpTo } from '@/features/urls/api/urlsApi';
import type { UrlMapping as DashboardUrlMapping } from '@/features/urls/types/url';
import type {
  DashboardActivityItem,
  DashboardRecentUrlItem,
  DashboardStat,
} from '@/features/account/types/dashboard';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useToast } from '@/shared/ui';

const DASHBOARD_SAMPLE_SIZE = 120;

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    notation: value >= 1000 ? 'compact' : 'standard',
  }).format(value);
}

function getMonthSpan(urlMappings: DashboardUrlMapping[]) {
  if (urlMappings.length < 2) {
    return 1;
  }

  const timestamps = urlMappings.map((mapping) => new Date(mapping.createdAt).getTime());
  const newest = Math.max(...timestamps);
  const oldest = Math.min(...timestamps);
  const months = Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24 * 30));
  return Math.max(months, 1);
}

function buildActivity(urlMappings: DashboardUrlMapping[]): DashboardActivityItem[] {
  return urlMappings.slice(0, 4).map((mapping) => {
    const domain = getDomainLabel(mapping.originalUrl);
    const hasClicks = mapping.clickCount > 0;

    return {
      id: mapping.urlHash,
      primary: hasClicks
        ? `${domain} generated ${mapping.clickCount} ${mapping.clickCount === 1 ? 'click' : 'clicks'}`
        : `${domain} was shortened`,
      secondary: hasClicks
        ? 'Short link is active and collecting traffic'
        : 'Created recently and ready to share',
    };
  });
}

export function useDashboardOverview() {
  const toast = useToast();
  const [urlMappings, setUrlMappings] = useState<DashboardUrlMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setIsLoading(true);
      const mappings = await getUserUrlsUpTo(DASHBOARD_SAMPLE_SIZE);
      setUrlMappings(
        [...mappings].sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        ),
      );
      setError(null);
    } catch (requestError: unknown) {
      const message = getApiErrorMessage(requestError, 'Failed to load dashboard activity.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const summary = useMemo(() => {
    const totalUrls = urlMappings.length;
    const totalClicks = urlMappings.reduce((sum, mapping) => sum + mapping.clickCount, 0);
    const monthSpan = getMonthSpan(urlMappings);
    const averageLinksPerMonth = totalUrls / monthSpan;
    const clicksPerUrl = totalUrls > 0 ? totalClicks / totalUrls : 0;

    const stats: DashboardStat[] = [
      {
        label: 'Total URLs Created',
        value: formatCompactNumber(totalUrls),
        changeLabel: totalUrls > 0 ? `${monthSpan} month view` : 'No data yet',
      },
      {
        label: 'Total Clicks',
        value: formatCompactNumber(totalClicks),
        changeLabel: totalClicks > 0 ? 'Tracked across your links' : 'No clicks yet',
      },
      {
        label: 'Avg. Links / Month',
        value: totalUrls > 0 ? averageLinksPerMonth.toFixed(1) : '0.0',
        changeLabel: totalUrls > 0 ? 'Based on creation history' : 'Build your first month',
      },
      {
        label: 'Clicks per URL',
        value: totalUrls > 0 ? clicksPerUrl.toFixed(clicksPerUrl >= 10 ? 0 : 1) : '0.0',
        changeLabel: totalClicks > 0 ? 'Useful engagement baseline' : 'Traffic will show here',
      },
    ];

    return {
      activity: buildActivity(urlMappings),
      recentUrls: urlMappings.slice(0, 5).map<DashboardRecentUrlItem>((mapping) => ({
        clickCount: mapping.clickCount,
        createdAtLabel: formatUrlDate(mapping.createdAt),
        domain: getDomainLabel(mapping.originalUrl),
        shortSlug: getShortUrlSlug(mapping.shortUrl),
        urlHash: mapping.urlHash,
      })),
      stats,
    };
  }, [urlMappings]);

  return {
    error,
    isLoading,
    refetch: fetchOverview,
    ...summary,
  };
}
