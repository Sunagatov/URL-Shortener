import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { Button } from '@/shared/ui';
import { routes } from '@/app/routes';
import {
    FaLink,
    FaPlus,
    FaEye,
    FaChartLine
} from 'react-icons/fa';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    const quickActions = [
        {
            title: 'Create Short URL',
            description: 'Shorten a new URL',
            icon: FaPlus,
            action: () => navigate(routes.home),
            primary: true,
        },
        {
            title: 'View All URLs',
            description: 'Manage your links',
            icon: FaEye,
            action: () => navigate(routes.urlMappings),
            primary: false,
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#060612] bg-grid-dark">
            <AccountSidebar />

            <div className="flex-grow md:ml-64 px-4 pt-3 pb-8 sm:px-6 md:px-10 md:py-8">
                <div className="max-w-5xl mx-auto">

                    {/* Page header */}
                    <div className="mb-8 mt-3 md:mt-0 flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Dashboard</h1>
                            <p className="text-white/45 text-sm">Overview of your URL shortening activity</p>
                        </div>
                        <div className="flex gap-3">
                            {quickActions.map((action, i) => (
                                <Button
                                    key={i}
                                    onClick={action.action}
                                    variant={action.primary ? 'primary' : 'secondary'}
                                    size="sm"
                                >
                                    <action.icon className="w-3.5 h-3.5" />
                                    <span>{action.title}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Analytics placeholder */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/25 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaChartLine className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Analytics coming soon</p>
                            <p className="text-white/40 text-xs mt-0.5">Dashboard metrics will appear here when usage analytics are available.</p>
                        </div>
                    </div>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent URLs */}
                        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-bold text-white">Recent URLs</h3>
                                <Button
                                    onClick={() => navigate(routes.urlMappings)}
                                    variant="secondary"
                                    size="sm"
                                >
                                    View All
                                </Button>
                            </div>
                            <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-3">
                                    <FaLink className="w-4 h-4 text-white/20" />
                                </div>
                                <p className="text-white/30 text-sm">Recent URL activity is not available yet.</p>
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                            <h3 className="text-base font-bold text-white mb-5">Activity</h3>
                            <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-3">
                                    <FaChartLine className="w-4 h-4 text-white/20" />
                                </div>
                                <p className="text-white/30 text-sm text-center">Activity events will appear here when tracking is available.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
