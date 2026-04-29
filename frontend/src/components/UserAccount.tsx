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
                if (isMounted) setIsLoading(false);
            }
        };

        fetchUserDetails();
        return () => { isMounted = false; };
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
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#060612]">
                <SidePanel />
                <div className="flex-grow md:ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="flex min-h-screen bg-[#060612]">
                <SidePanel />
                <div className="flex-grow md:ml-64 flex items-center justify-center">
                    <p className={errorMessage ? 'text-red-400' : 'text-white/40'}>
                        {errorMessage || 'Unable to load user details'}
                    </p>
                </div>
            </div>
        );
    }

    const profileFields = [
        { icon: FaUser,        label: 'First Name',  value: userDetails.firstName ?? '-',  color: 'text-blue-400',    ring: 'bg-blue-600/20 border-blue-500/25'   },
        { icon: FaUser,        label: 'Last Name',   value: userDetails.lastName ?? '-',   color: 'text-violet-400',  ring: 'bg-violet-600/20 border-violet-500/25' },
        { icon: FaEnvelope,    label: 'Email',       value: userDetails.email,              color: 'text-emerald-400', ring: 'bg-emerald-600/20 border-emerald-500/25' },
        { icon: FaGlobe,       label: 'Country',     value: userDetails.country ?? '-',    color: 'text-amber-400',   ring: 'bg-amber-600/20 border-amber-500/25'  },
        { icon: FaCalendarAlt, label: 'Age',         value: typeof userDetails.age === 'number' ? `${userDetails.age} years old` : '-', color: 'text-rose-400', ring: 'bg-rose-600/20 border-rose-500/25', wide: true },
    ];

    return (
        <div className="flex min-h-screen bg-[#060612] bg-grid-dark">
            <SidePanel />

            <div className="flex-grow md:ml-64 px-6 py-8 md:px-10">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 mt-14 md:mt-0">
                        <h1 className="text-3xl font-black text-white mb-1 tracking-tight">My Profile</h1>
                        <p className="text-white/45 text-sm">Manage your personal information and preferences</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main profile card */}
                        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                            {/* Gradient header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-7 relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 flex-shrink-0">
                                        <span className="text-xl font-black text-white">
                                            {getInitials(userDetails.firstName, userDetails.lastName)}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-0.5">{getDisplayName(userDetails)}</h2>
                                        <p className="text-blue-100 text-sm">{userDetails.email}</p>
                                        <p className="text-blue-200/70 text-xs mt-1">
                                            Member since {userDetails.createdAt ? formatDate(userDetails.createdAt) : '—'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled
                                    title="Profile editing is not implemented yet"
                                    className="absolute top-4 right-4 bg-white/10 text-white/60 px-3 py-1.5 rounded-lg cursor-not-allowed flex items-center gap-2 border border-white/20 text-xs"
                                >
                                    <FaEdit className="w-3 h-3" />
                                    <span className="hidden sm:inline">Edit (coming soon)</span>
                                </button>
                            </div>

                            {/* Profile fields */}
                            <div className="p-6">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Personal Information</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {profileFields.map((field, i) => {
                                        const Icon = field.icon;
                                        return (
                                            <div key={i} className={`flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-xl ${field.wide ? 'md:col-span-2' : ''}`}>
                                                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${field.ring}`}>
                                                    <Icon className={`w-3.5 h-3.5 ${field.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white/35 font-medium">{field.label}</p>
                                                    <p className="text-sm font-semibold text-white">{field.value}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar cards */}
                        <div className="space-y-4">
                            {/* Account Stats */}
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Account Stats</p>
                                <p className="text-xs text-white/30 mb-4">Usage analytics are not available yet.</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/50">Member Since</span>
                                    <span className="text-xs font-semibold text-white">
                                        {userDetails.createdAt ? formatDate(userDetails.createdAt) : '—'}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Quick Actions</p>
                                <div className="space-y-1">
                                    {[
                                        { icon: FaEdit,  label: 'Edit Profile (coming soon)'          },
                                        { icon: FaUser,  label: 'Change Password (use Security)'      },
                                        { icon: FaGlobe, label: 'Export Data (coming soon)'           },
                                    ].map((action, i) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                disabled
                                                className="w-full flex items-center gap-3 p-3 rounded-xl text-white/25 cursor-not-allowed text-left"
                                            >
                                                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="text-xs font-medium">{action.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Profile Completion */}
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Profile Completion</p>
                                <p className="text-xs text-white/30">Profile completion tracking is not available yet.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAccount;
