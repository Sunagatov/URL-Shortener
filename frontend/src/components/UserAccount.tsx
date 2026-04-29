import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage, isSessionInvalidError } from '../utils/apiErrors';
import type { User } from '../types';
import SidePanel from './SidePanel';
import { FaEdit, FaUser, FaEnvelope, FaGlobe, FaCalendarAlt } from 'react-icons/fa';

const UserAccount: React.FC = () => {
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const fetchUserDetails = async () => {
            try {
                setIsLoading(true);
                const response = await ApiService.getUserProfile();
                if (isMounted) {
                    setUserDetails(response);
                    setErrorMessage('');
                }
            } catch (error: unknown) {
                if (isMounted && isSessionInvalidError(error)) {
                    logout();
                    navigate('/signin', { replace: true });
                    return;
                }

                if (isMounted) {
                    setErrorMessage(getApiErrorMessage(error, 'Failed to fetch user details.'));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchUserDetails();

        return () => {
            isMounted = false;
        };
    }, [logout, navigate]);

    const getInitials = (firstName?: string, lastName?: string) => {
        const initials = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
        return initials || 'U';
    };

    const getDisplayName = (user: User) => {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        return fullName || 'User';
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    if (isLoading) {
        return (
            <div className="flex min-h-screen">
                <SidePanel />
                <div className="flex-grow md:ml-72 p-8">
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="flex min-h-screen">
                <SidePanel />
                <div className="flex-grow md:ml-72 p-8">
                    <div className="flex items-center justify-center h-96">
                        <p className={errorMessage ? 'text-red-600' : 'text-gray-500'}>
                            {errorMessage || 'Unable to load user details'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <SidePanel />
            <div className="flex-grow md:ml-72 p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                        <p className="text-gray-600">Manage your personal information and preferences</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                {/* Header with gradient */}
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 relative">
                                    <div className="flex items-center space-x-4">
                                        {/* Avatar */}
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                                            <span className="text-lg font-bold text-white">
                                                {getInitials(userDetails.firstName, userDetails.lastName)}
                                            </span>
                                        </div>
                                        
                                        {/* User Info */}
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">
                                                {getDisplayName(userDetails)}
                                            </h2>
                                            <p className="text-blue-100">{userDetails.email}</p>
                                            <p className="text-blue-200 text-sm mt-1">
                                                Member since {userDetails.createdAt ? formatDate(userDetails.createdAt) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Edit Button */}
                                    <button
                                        type="button"
                                        disabled
                                        className="absolute top-4 right-4 bg-white/10 text-white/70 px-3 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2 border border-white/20"
                                        title="Profile editing is not implemented yet"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                        <span className="hidden sm:inline text-sm">Edit (coming soon)</span>
                                    </button>
                                </div>

                                {/* Profile Details */}
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FaUser className="w-3 h-3 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">First Name</p>
                                                <p className="text-sm font-semibold text-gray-900">{userDetails.firstName ?? '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FaUser className="w-3 h-3 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">Last Name</p>
                                                <p className="text-sm font-semibold text-gray-900">{userDetails.lastName ?? '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <FaEnvelope className="w-3 h-3 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">Email</p>
                                                <p className="text-sm font-semibold text-gray-900">{userDetails.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <FaGlobe className="w-3 h-3 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">Country</p>
                                                <p className="text-sm font-semibold text-gray-900">{userDetails.country ?? '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <FaCalendarAlt className="w-3 h-3 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">Age</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {typeof userDetails.age === 'number' ? `${userDetails.age} years old` : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Account Stats */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h3>
                                <p className="text-sm text-gray-500 mb-4">Usage analytics are not available yet.</p>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Member Since</span>
                                    <span className="font-semibold text-gray-900">
                                        {userDetails.createdAt ? formatDate(userDetails.createdAt) : '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        disabled
                                        className="w-full flex items-center space-x-3 p-3 text-left rounded-lg cursor-not-allowed text-gray-400"
                                        title="Profile editing is not implemented yet"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                        <span className="text-sm font-medium">Edit Profile (coming soon)</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        className="w-full flex items-center space-x-3 p-3 text-left rounded-lg cursor-not-allowed text-gray-400"
                                        title="Password settings are available on the Security page"
                                    >
                                        <FaUser className="w-4 h-4" />
                                        <span className="text-sm font-medium">Change Password (use Security)</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        className="w-full flex items-center space-x-3 p-3 text-left rounded-lg cursor-not-allowed text-gray-400"
                                        title="Data export is not implemented yet"
                                    >
                                        <FaGlobe className="w-4 h-4" />
                                        <span className="text-sm font-medium">Export Data (coming soon)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Profile Completion */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                                <p className="text-sm text-gray-500">Profile completion tracking is not available yet.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAccount;
