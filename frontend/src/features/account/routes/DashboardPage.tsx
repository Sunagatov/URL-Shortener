import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountPageHeader, AccountPageLayout } from '@/app/layout/AccountPageLayout';
import { Button } from '@/shared/ui';
import { routes } from '@/app/routes';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { FaLink, FaPlus, FaEye, FaChartBar, FaMousePointer, FaClock, FaArrowUp } from 'react-icons/fa';

const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    iconColor: string;
    iconBg: string;
}> = ({ icon: Icon, label, iconColor, iconBg }) => (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="flex items-center gap-1 text-xs text-white/25">
                <FaArrowUp className="w-2.5 h-2.5" />
                <span>—</span>
            </div>
        </div>
        <div>
            <div className="skeleton h-7 w-20 mb-2" />
            <p className="text-xs text-white/40 font-medium">{label}</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    usePageTitle('Dashboard');
    const navigate = useNavigate();

    const stats = [
        { icon: FaLink,         label: 'Total URLs Created',  iconColor: 'text-blue-400',    iconBg: 'bg-blue-600/20 border border-blue-500/20' },
        { icon: FaMousePointer, label: 'Total Clicks',        iconColor: 'text-indigo-400',  iconBg: 'bg-indigo-600/20 border border-indigo-500/20' },
        { icon: FaClock,        label: 'Avg. Links / Month',  iconColor: 'text-violet-400',  iconBg: 'bg-violet-600/20 border border-violet-500/20' },
        { icon: FaChartBar,     label: 'Click-through Rate',  iconColor: 'text-slate-400',   iconBg: 'bg-slate-600/20 border border-slate-500/20' },
    ];

    return (
        <AccountPageLayout contentClassName="max-w-5xl mx-auto">
                    <AccountPageHeader
                        title="Dashboard"
                        description="Overview of your URL shortening activity"
                        actions={(
                            <div className="flex gap-2">
                                <Button onClick={() => navigate(routes.home)} variant="primary" size="sm">
                                    <FaPlus className="w-3.5 h-3.5" />
                                    <span>Create Short URL</span>
                                </Button>
                                <Button onClick={() => navigate(routes.urlMappings)} variant="secondary" size="sm">
                                    <FaEye className="w-3.5 h-3.5" />
                                    <span>View All URLs</span>
                                </Button>
                            </div>
                        )}
                    />

                    {/* Analytics coming soon banner */}
                    <div className="rounded-xl bg-blue-950/40 border border-blue-500/15 p-4 mb-8 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaChartBar className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium">Analytics coming soon</p>
                            <p className="text-white/35 text-xs mt-0.5">Dashboard metrics will appear here when usage analytics are available.</p>
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {stats.map((s, i) => (
                            <StatCard key={i} {...s} />
                        ))}
                    </div>

                    {/* Content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Recent URLs */}
                        <div className="lg:col-span-2 rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-white">Recent URLs</h3>
                                    <p className="text-xs text-white/35 mt-0.5">Your latest shortened links</p>
                                </div>
                                <Button onClick={() => navigate(routes.urlMappings)} variant="secondary" size="sm">
                                    View All
                                </Button>
                            </div>
                            <div className="divide-y divide-white/[0.05]">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex-shrink-0 flex items-center justify-center">
                                            <FaLink className="w-3 h-3 text-white/20" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="skeleton h-3.5 w-32 mb-1.5" />
                                            <div className="skeleton h-3 w-48" />
                                        </div>
                                        <div className="skeleton h-3 w-16" />
                                    </div>
                                ))}
                                <div className="px-5 py-4 text-center">
                                    <p className="text-xs text-white/25">Recent URL activity is not available yet.</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/[0.07]">
                                <h3 className="text-sm font-semibold text-white">Activity</h3>
                                <p className="text-xs text-white/35 mt-0.5">Recent events</p>
                            </div>
                            <div className="p-5 space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="skeleton w-7 h-7 rounded-lg flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="skeleton h-3 w-28 mb-1.5" />
                                            <div className="skeleton h-2.5 w-16" />
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-white/25 text-center pt-2">Activity tracking not available yet.</p>
                            </div>
                        </div>
                    </div>
        </AccountPageLayout>
    );
};

export default DashboardPage;
