import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { useDashboardOverview } from '@/features/account/model/useDashboardOverview';
import {
  DashboardActivityPanel,
  DashboardOverviewBanner,
  DashboardRecentUrlsPanel,
  DashboardStatsGrid,
} from '@/features/account/ui/DashboardOverviewPanels';
import { AccountPageHeader, AccountPageLayout } from '@/app/layout/AccountPageLayout';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button } from '@/shared/ui';
import { FaEye, FaPlus } from 'react-icons/fa';

const DashboardPage: React.FC = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const { activity, error, isLoading, recentUrls, refetch, stats } = useDashboardOverview();

  return (
    <AccountPageLayout contentClassName="mx-auto max-w-5xl">
      <AccountPageHeader
        title="Dashboard"
        description="Overview of your URL shortening activity"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate(routes.home)} variant="primary" size="sm">
              <FaPlus className="h-3.5 w-3.5" />
              <span>Create Short URL</span>
            </Button>
            <Button onClick={() => navigate(routes.urlMappings)} variant="secondary" size="sm">
              <FaEye className="h-3.5 w-3.5" />
              <span>View All URLs</span>
            </Button>
          </div>
        }
      />

      <DashboardOverviewBanner isLoading={isLoading} onRefresh={() => void refetch()} />

      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-900/15 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <DashboardStatsGrid stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <DashboardRecentUrlsPanel
          isLoading={isLoading}
          onOpenAll={() => navigate(routes.urlMappings)}
          onOpenDetails={urlHash => navigate(routes.urlDetails(urlHash))}
          recentUrls={recentUrls}
        />
        <DashboardActivityPanel activity={activity} isLoading={isLoading} />
      </div>
    </AccountPageLayout>
  );
};

export default DashboardPage;
