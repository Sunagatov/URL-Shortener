import { test, expect } from '@playwright/test';
import { signUpUser } from './helpers';

test('renders analytics data and refreshes the chart when the event filter changes', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await signUpUser(page);

  await page.route('**/api/v1/analytics/**', async route => {
    const url = new URL(route.request().url());
    const resource = url.pathname.split('/').at(-1);
    const count = url.searchParams.get('eventType') === 'QR_SCAN' ? 3 : 12;
    const response = resource === 'summary'
      ? {
          urlHash: null,
          selectedRange: { from: '2026-11-01T00:00:00Z', to: '2026-11-08T00:00:00Z', timezone: 'UTC' },
          metrics: { totalClicks: count, clicksInRange: count, previousPeriodClicks: 0, changeAbsolute: count, changePercent: null, estimatedUniqueVisitors: 2 },
          filters: { eventType: url.searchParams.get('eventType'), includeBots: false },
        }
      : resource === 'timeseries'
        ? { urlHash: null, bucket: 'day', points: [
            { timestamp: '2026-11-06T00:00:00Z', count: 1 },
            { timestamp: '2026-11-07T00:00:00Z', count },
          ] }
        : { dimension: resource, items: [] };
    await route.fulfill({ json: response });
  });

  await page.goto('/account/analytics');
  await expect(page.getByRole('heading', { name: 'Analytics', exact: true })).toBeVisible();
  await expect(page.locator('.recharts-area-area')).toHaveAttribute('d', /.+/);
  const chart = page.locator('.recharts-surface');
  await chart.hover({ position: { x: 100, y: 100 } });
  await expect(page.locator('.recharts-tooltip-wrapper')).toBeVisible();

  const filteredRequest = page.waitForResponse(response =>
    response.url().includes('/analytics/timeseries?') && response.url().includes('eventType=QR_SCAN')
  );
  await page.getByRole('button', { name: 'QR Scans', exact: true }).click();
  await filteredRequest;
  await expect(page.locator('.recharts-area-area')).toHaveAttribute('d', /.+/);
  await expect(page.getByText('Failed to load analytics')).toHaveCount(0);
  expect(runtimeErrors).toEqual([]);
});
