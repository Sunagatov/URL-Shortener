import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidePanel from './SidePanel';
import { Button } from './ui';
import { 
    FaLink, 
    FaPlus, 
    FaEye, 
    FaChartLine
} from 'react-icons/fa';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const quickActions = [
        {
            title: 'Create Short URL',
            description: 'Shorten a new URL',
            icon: FaPlus,
            color: 'bg-blue-600 hover:bg-blue-700',
            action: () => navigate('/')
        },
        {
            title: 'View All URLs',
            description: 'Manage your links',
            icon: FaEye,
            color: 'bg-green-600 hover:bg-green-700',
            action: () => navigate('/account/url-mappings')
        }
    ];



    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <SidePanel />
            <div className="flex-grow md:ml-72 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Clean Header */}
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                                <p className="text-xl text-gray-600">Overview of your URL shortening activity</p>
                            </div>
                            <div className="flex space-x-3 flex-shrink-0">
                                {quickActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        onClick={action.action}
                                        variant={index === 0 ? 'primary' : 'secondary'}
                                    >
                                        <action.icon className="w-4 h-4" />
                                        <span>{action.title}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FaChartLine className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Analytics coming soon</h2>
                                <p className="text-gray-600">Dashboard metrics will appear here when usage analytics are available.</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent URLs */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">Recent URLs</h3>
                                    <Button 
                                        onClick={() => navigate('/account/url-mappings')}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        View All
                                    </Button>
                                </div>
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <FaLink className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Recent URL activity is not available yet.</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Activity</h3>
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <FaChartLine className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Activity events will appear here when tracking is available.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
