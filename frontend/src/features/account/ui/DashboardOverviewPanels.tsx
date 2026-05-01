import React from 'react';
import { Button } from '@/shared/ui';
import {
  FaArrowUp,
  FaChartBar,
  FaChevronRight,
  FaClock,
  FaEye,
  FaLink,
  FaMousePointer,
  FaRedo,
} from 'react-icons/fa';

type DashboardStat = {
  changeLabel: string;
  label: string;
  value: string;
};

type DashboardActivityItem = {
  id: string;
  primary: string;
  secondary: string;
};

type DashboardRecentUrlItem = {
  clickCount: number;
  createdAtLabel: string;
  domain: string;
  shortSlug: string;
  urlHash: string;
};

const statMeta = [
  { icon: FaLink, iconColor: 'text-blue-400', iconBg: 'bg-blue-600/20 border border-blue-500/20' },
  {
    icon: FaMousePointer,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-600/20 border border-indigo-500/20',
  },
  {
    icon: FaClock,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-600/20 border border-violet-500/20',
  },
  { icon: FaChartBar, iconColor: 'text-slate-400', iconBg: 'bg-slate-600/20 border border-slate-500/20' },
] as const;

const StatCard: React.FC<DashboardStat & { icon: React.ElementType; iconBg: string; iconColor: string }> = ({
  changeLabel,
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
}) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
    <div className="flex items-center justify-between">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex items-center gap-1 text-xs text-white/25">
        <FaArrowUp className="h-2.5 w-2.5" />
        <span>{changeLabel}</span>
      </div>
    </div>
    <div>
      <p className="mb-2 text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs font-medium text-white/40">{label}</p>
    </div>
  </div>
);

export const DashboardOverviewBanner: React.FC<{
  isLoading: boolean;
  onRefresh: () => void;
}> = ({ isLoading, onRefresh }) => (
  <div className="mb-8 flex items-center gap-3 rounded-xl border border-blue-500/15 bg-blue-950/40 p-4">
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-600/20">
      <FaChartBar className="h-3.5 w-3.5 text-blue-400" />
    </div>
    <div>
      <p className="text-sm font-medium text-white/80">Live overview</p>
      <p className="mt-0.5 text-xs text-white/35">
        This dashboard summarizes your latest link data from the current API surface.
      </p>
    </div>
    <Button onClick={onRefresh} variant="ghost" size="sm" className="ml-auto">
      <FaRedo className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  </div>
);

export const DashboardStatsGrid: React.FC<{
  stats: DashboardStat[];
}> = ({ stats }) => (
  <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
    {stats.map((stat, index) => (
      <StatCard key={stat.label} {...stat} {...statMeta[index]} />
    ))}
  </div>
);

export const DashboardRecentUrlsPanel: React.FC<{
  isLoading: boolean;
  onOpenAll: () => void;
  onOpenDetails: (urlHash: string) => void;
  recentUrls: DashboardRecentUrlItem[];
}> = ({ isLoading, onOpenAll, onOpenDetails, recentUrls }) => (
  <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] lg:col-span-2">
    <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Recent URLs</h3>
        <p className="mt-0.5 text-xs text-white/35">Your latest shortened links</p>
      </div>
      <Button onClick={onOpenAll} variant="secondary" size="sm">
        <FaEye className="h-3.5 w-3.5" />
        <span>View All</span>
      </Button>
    </div>
    <div className="divide-y divide-white/[0.05]">
      {isLoading
        ? [...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                <FaLink className="h-3 w-3 text-white/20" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="skeleton mb-1.5 h-3.5 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
              <div className="skeleton h-3 w-16" />
            </div>
          ))
        : recentUrls.map((mapping) => (
            <button
              key={mapping.urlHash}
              onClick={() => onOpenDetails(mapping.urlHash)}
              className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.035]"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-600/12">
                <FaLink className="h-3 w-3 text-blue-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{mapping.domain}</p>
                <p className="truncate text-xs text-white/35">.../{mapping.shortSlug}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white/65">{mapping.clickCount} clicks</p>
                <p className="text-[11px] text-white/25">{mapping.createdAtLabel}</p>
              </div>
              <FaChevronRight className="h-3 w-3 text-white/20" />
            </button>
          ))}
      {!isLoading && recentUrls.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-white/45">No URLs yet.</p>
          <p className="mt-1 text-xs text-white/25">Create your first short link to populate the dashboard.</p>
        </div>
      ) : null}
    </div>
  </div>
);

export const DashboardActivityPanel: React.FC<{
  activity: DashboardActivityItem[];
  isLoading: boolean;
}> = ({ activity, isLoading }) => (
  <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04]">
    <div className="border-b border-white/[0.07] px-5 py-4">
      <h3 className="text-sm font-semibold text-white">Activity</h3>
      <p className="mt-0.5 text-xs text-white/35">Recent events inferred from your links</p>
    </div>
    <div className="space-y-3 p-5">
      {isLoading
        ? [...Array(4)].map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="skeleton mt-0.5 h-7 w-7 flex-shrink-0 rounded-lg" />
              <div className="flex-1">
                <div className="skeleton mb-1.5 h-3 w-28" />
                <div className="skeleton h-2.5 w-16" />
              </div>
            </div>
          ))
        : activity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                <FaChartBar className="h-3 w-3 text-cyan-300" />
              </div>
              <div>
                <p className="text-sm text-white/80">{item.primary}</p>
                <p className="mt-1 text-xs text-white/35">{item.secondary}</p>
              </div>
            </div>
          ))}
      {!isLoading && activity.length === 0 ? (
        <p className="pt-2 text-center text-xs text-white/25">Activity will appear after you create links.</p>
      ) : null}
    </div>
  </div>
);
