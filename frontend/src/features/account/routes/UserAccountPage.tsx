import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/features/account/api/accountApi';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { useAuth } from '@/shared/auth/useAuth';
import { getApiErrorMessage, isSessionInvalidError } from '@/shared/lib/apiErrors';
import { useToast } from '@/shared/ui';
import type { User } from '@/shared/types';
import { routes } from '@/app/routes';
import { FaEdit, FaUser, FaEnvelope, FaGlobe, FaCalendarAlt, FaShieldAlt, FaDownload } from 'react-icons/fa';

const UserAccountPage: React.FC = () => {
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const toast = useToast();

    useEffect(() => {
        let isMounted = true;
        const fetchUserDetails = async () => {
            try {
                setIsLoading(true);
                const response = await getUserProfile();
                if (isMounted) { setUserDetails(response); }
            } catch (error: unknown) {
                if (isMounted && isSessionInvalidError(error)) { logout(); navigate(routes.signIn, { replace: true }); return; }
                if (isMounted) toast.error(getApiErrorMessage(error, 'Failed to fetch user details.'));
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchUserDetails();
        return () => { isMounted = false; };
    }, [logout, navigate]);

    const getInitials = (u: User) =>
        `${u.firstName?.charAt(0) ?? ''}${u.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U';

    const getDisplayName = (u: User) =>
        [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || 'User';

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] md:min-h-[calc(100vh-96px)]">
                <AccountSidebar />
                <div className="flex-grow md:ml-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                        <p className="text-white/30 text-sm">Loading profile…</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] md:min-h-[calc(100vh-96px)]">
                <AccountSidebar />
                <div className="flex-grow md:ml-64 flex items-center justify-center px-6">
                    <p className="text-white/35 text-sm">Unable to load user details</p>
                </div>
            </div>
        );
    }

    const infoFields = [
        { icon: FaUser,        label: 'First Name',  value: userDetails.firstName  ?? '—' },
        { icon: FaUser,        label: 'Last Name',   value: userDetails.lastName   ?? '—' },
        { icon: FaEnvelope,    label: 'Email',       value: userDetails.email,              wide: true },
        { icon: FaGlobe,       label: 'Country',     value: userDetails.country    ?? '—' },
        { icon: FaCalendarAlt, label: 'Age',         value: typeof userDetails.age === 'number' ? `${userDetails.age} years old` : '—' },
    ];

    return (
        <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] bg-grid-dark md:min-h-[calc(100vh-96px)]">
            <AccountSidebar />

            <div className="flex-grow md:ml-64 px-4 pt-3 pb-10 sm:px-6 md:px-10 md:py-8">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 mt-3 md:mt-0">
                        <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            My Profile
                        </h1>
                        <p className="text-white/40 text-sm mt-0.5">Manage your personal information and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* Profile card */}
                        <div className="lg:col-span-2 rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
                            {/* Avatar header */}
                            <div className="relative px-6 py-6 bg-gradient-to-r from-[#0d1628] to-[#0a0e20] border-b border-white/[0.07]">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border-2 border-blue-500/25 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl font-bold text-blue-300" style={{ fontFamily: 'var(--font-display)' }}>
                                            {getInitials(userDetails)}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                                            {getDisplayName(userDetails)}
                                        </h2>
                                        <p className="text-white/45 text-sm">{userDetails.email}</p>
                                        {userDetails.createdAt && (
                                            <p className="text-white/25 text-xs mt-1">
                                                Member since {formatDate(userDetails.createdAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled
                                    title="Profile editing is not available yet"
                                    className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/30 cursor-not-allowed text-xs"
                                >
                                    <FaEdit className="w-3 h-3" />
                                    <span className="hidden sm:inline">Edit (coming soon)</span>
                                </button>
                            </div>

                            {/* Fields */}
                            <div className="p-5">
                                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">Personal Information</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {infoFields.map((field, i) => {
                                        const Icon = field.icon;
                                        return (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-3 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl ${field.wide ? 'md:col-span-2' : ''}`}
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-3.5 h-3.5 text-blue-400/70" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">{field.label}</p>
                                                    <p className="text-sm font-semibold text-white/85 mt-0.5">{field.value}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar cards */}
                        <div className="space-y-4">
                            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-5">
                                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">Account Stats</p>
                                <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                                    <span className="text-xs text-white/40">Member Since</span>
                                    <span className="text-xs font-semibold text-white/70" style={{ fontFamily: 'var(--font-mono)' }}>
                                        {userDetails.createdAt ? formatDate(userDetails.createdAt) : '—'}
                                    </span>
                                </div>
                                <p className="text-xs text-white/20 mt-3">Usage analytics will appear here when available.</p>
                            </div>

                            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-5">
                                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Quick Actions</p>
                                <div className="space-y-1">
                                    {[
                                        { icon: FaEdit,      label: 'Edit Profile',     note: 'coming soon' },
                                        { icon: FaShieldAlt, label: 'Change Password',  note: 'use Security page', path: routes.security },
                                        { icon: FaDownload,  label: 'Export Data',      note: 'coming soon' },
                                    ].map((a, i) => {
                                        const Icon = a.icon;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                disabled={!a.path}
                                                onClick={a.path ? () => navigate(a.path!) : undefined}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                                                    a.path
                                                        ? 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                                                        : 'text-white/20 cursor-not-allowed'
                                                }`}
                                            >
                                                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="text-xs font-medium">{a.label}</span>
                                                <span className="text-[10px] text-white/20 ml-auto">{a.note}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAccountPage;
