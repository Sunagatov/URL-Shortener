import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { routes } from '@/app/routes';
import { deleteUrl, getUrlDetails } from '@/features/urls/api/urlsApi';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/apiErrors';
import { Button } from '@/shared/ui';
import type { UrlMapping } from '@/shared/types';
import {
    FaArrowLeft,
    FaCopy,
    FaExternalLinkAlt,
    FaLink,
    FaCalendarAlt,
    FaClock,
    FaQrcode,
    FaTrash,
    FaEdit
} from 'react-icons/fa';

const UrlMappingDetailsPage: React.FC = () => {
    const { urlHash } = useParams<{ urlHash: string }>();
    const [urlMapping, setUrlMapping] = useState<UrlMapping | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUrlMapping = async () => {
            if (!urlHash) {
                setErrorMessage('URL mapping id is missing.');
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const response = await getUrlDetails(urlHash);
                setUrlMapping(response);
            } catch (error: unknown) {
                if (getApiErrorStatus(error) === 401) {
                    navigate(routes.signIn, { replace: true });
                    return;
                }

                if (getApiErrorStatus(error) === 404) {
                    setUrlMapping(null);
                    setErrorMessage('The requested URL mapping could not be found.');
                    return;
                }

                setErrorMessage(getApiErrorMessage(error, 'Failed to fetch URL mapping details.'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchUrlMapping();
    }, [navigate, urlHash]);

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (error) {
            console.error('Failed to copy URL:', error);
        }
    };

    const handleDelete = async () => {
        if (!urlMapping) return;
        const confirmDelete = window.confirm('Are you sure you want to delete this URL mapping?');
        if (!confirmDelete) return;
        try {
            await deleteUrl(urlMapping.urlHash);
            navigate(routes.urlMappings);
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) {
                navigate(routes.signIn, { replace: true });
                return;
            }
            setErrorMessage(getApiErrorMessage(error, 'Failed to delete URL mapping.'));
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });

    const getDomainFromUrl = (url: string) => {
        try { return new URL(url).hostname; } catch { return url; }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#060612]">
                <AccountSidebar />
                <div className="flex-grow md:ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                </div>
            </div>
        );
    }

    if (!urlMapping) {
        return (
            <div className="flex min-h-screen bg-[#060612]">
                <AccountSidebar />
                <div className="flex-grow md:ml-64 flex items-center justify-center px-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-3">URL Not Found</h2>
                        <p className="text-white/40 text-sm mb-6">{errorMessage || 'The requested URL mapping could not be found.'}</p>
                        <Button onClick={() => navigate(routes.urlMappings)} size="sm">Back to My URLs</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#060612] bg-grid-dark">
            <AccountSidebar />

            <div className="flex-grow md:ml-64 px-4 pt-3 pb-8 sm:px-6 md:px-10 md:py-8">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 mt-3 md:mt-0">
                        <button
                            onClick={() => navigate(routes.urlMappings)}
                            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors group"
                        >
                            <FaArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                            Back to My URLs
                        </button>
                        <h1 className="text-3xl font-black text-white mb-1 tracking-tight">URL Details</h1>
                        <p className="text-white/45 text-sm">Manage and view your shortened URL information</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                        {/* Gradient header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 sm:px-8">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                                        <FaLink className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-0.5">Shortened URL</h2>
                                        <p className="text-blue-100/70 text-sm">{getDomainFromUrl(urlMapping.originalUrl)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" disabled title="URL editing is not implemented yet">
                                        <FaEdit className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Edit (coming soon)</span>
                                    </Button>
                                    <Button onClick={handleDelete} variant="danger" size="sm">
                                        <FaTrash className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Delete</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                                {/* URLs */}
                                <div className="space-y-5">
                                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">URL Information</p>

                                    {/* Short URL */}
                                    <div>
                                        <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Short URL</label>
                                        <div className="flex items-center gap-2 p-4 bg-emerald-900/20 border border-emerald-500/25 rounded-xl">
                                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FaLink className="w-3.5 h-3.5 text-emerald-400" />
                                            </div>
                                            <a
                                                href={urlMapping.shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-emerald-400 hover:text-emerald-300 font-medium break-all text-sm transition-colors"
                                            >
                                                {urlMapping.shortUrl}
                                            </a>
                                            <button
                                                onClick={() => handleCopyUrl(urlMapping.shortUrl)}
                                                className="p-2 text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                title="Copy"
                                            >
                                                <FaCopy className="w-3.5 h-3.5" />
                                            </button>
                                            <a
                                                href={urlMapping.shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                title="Open"
                                            >
                                                <FaExternalLinkAlt className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                        {copiedUrl === urlMapping.shortUrl && (
                                            <p className="text-xs text-emerald-400 mt-1.5">✓ Copied!</p>
                                        )}
                                    </div>

                                    {/* Original URL */}
                                    <div>
                                        <label className="block text-xs text-white/40 font-medium mb-2 uppercase tracking-wider">Original URL</label>
                                        <div className="flex items-center gap-2 p-4 bg-blue-900/20 border border-blue-500/25 rounded-xl">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FaExternalLinkAlt className="w-3.5 h-3.5 text-blue-400" />
                                            </div>
                                            <a
                                                href={urlMapping.originalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-blue-400 hover:text-blue-300 font-medium break-all text-sm transition-colors"
                                            >
                                                {urlMapping.originalUrl}
                                            </a>
                                            <button
                                                onClick={() => handleCopyUrl(urlMapping.originalUrl)}
                                                className="p-2 text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Copy"
                                            >
                                                <FaCopy className="w-3.5 h-3.5" />
                                            </button>
                                            <a
                                                href={urlMapping.originalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Open"
                                            >
                                                <FaExternalLinkAlt className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                        {copiedUrl === urlMapping.originalUrl && (
                                            <p className="text-xs text-emerald-400 mt-1.5">✓ Copied!</p>
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-5">
                                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Details & Analytics</p>

                                    <div className="flex items-center gap-3 p-4 bg-violet-900/20 border border-violet-500/25 rounded-xl">
                                        <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FaCalendarAlt className="w-3.5 h-3.5 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/35 mb-0.5">Created</p>
                                            <p className="text-sm font-semibold text-white">{formatDate(urlMapping.createdAt)}</p>
                                        </div>
                                    </div>

                                    {urlMapping.expirationDate && (
                                        <div className="flex items-center gap-3 p-4 bg-amber-900/20 border border-amber-500/25 rounded-xl">
                                            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FaClock className="w-3.5 h-3.5 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/35 mb-0.5">Expires</p>
                                                <p className="text-sm font-semibold text-white">{formatDate(urlMapping.expirationDate)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl opacity-40 cursor-not-allowed">
                                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FaQrcode className="w-3.5 h-3.5 text-white/50" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/35 mb-0.5">QR Code</p>
                                            <p className="text-sm text-white/50">Coming soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrlMappingDetailsPage;
