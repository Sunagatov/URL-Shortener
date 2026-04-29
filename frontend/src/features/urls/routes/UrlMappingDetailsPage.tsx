import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { routes } from '@/app/routes';
import { deleteUrl, getUrlDetails } from '@/features/urls/api/urlsApi';
import { copyToClipboard } from '@/shared/lib/clipboard';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/apiErrors';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button, useToast, ConfirmModal } from '@/shared/ui';
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
    FaLock,
    FaCheck,
} from 'react-icons/fa';

const UrlMappingDetailsPage: React.FC = () => {
    usePageTitle('URL Details');
    const { urlHash } = useParams<{ urlHash: string }>();
    const [urlMapping, setUrlMapping]     = useState<UrlMapping | null>(null);
    const [isLoading, setIsLoading]       = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copiedUrl, setCopiedUrl]       = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting]     = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const fetchUrlMapping = async () => {
            if (!urlHash) {
                const message = 'URL mapping id is missing.';
                setUrlMapping(null);
                setErrorMessage(message);
                toast.error(message);
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const response = await getUrlDetails(urlHash);
                setUrlMapping(response);
                setErrorMessage(null);
            } catch (error: unknown) {
                if (getApiErrorStatus(error) === 401) { navigate(routes.signIn, { replace: true }); return; }
                const message = getApiErrorMessage(error, 'Failed to fetch URL mapping details.');
                setUrlMapping(null);
                setErrorMessage(message);
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUrlMapping();
    }, [navigate, toast, urlHash]);

    const handleCopyUrl = async (url: string) => {
        const didCopy = await copyToClipboard(url);
        if (!didCopy) {
            toast.error('Unable to copy URL.');
            return;
        }

        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
        toast.success('Copied to clipboard');
    };

    const handleDelete = async () => {
        if (!urlMapping) return;
        setIsDeleting(true);
        try {
            await deleteUrl(urlMapping.urlHash);
            navigate(routes.urlMappings);
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) { navigate(routes.signIn, { replace: true }); return; }
            toast.error(getApiErrorMessage(error, 'Failed to delete URL mapping.'));
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getDomain = (url: string) => { try { return new URL(url).hostname.replace('www.', ''); } catch { return url; } };

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] md:min-h-[calc(100vh-96px)]">
                <AccountSidebar />
                <div className="flex-grow md:ml-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                        <p className="text-white/30 text-sm">Loading URL details…</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!urlMapping) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] md:min-h-[calc(100vh-96px)]">
                <AccountSidebar />
                <div className="flex-grow md:ml-64 flex items-center justify-center px-6">
                    <div className="text-center max-w-sm">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.04] flex items-center justify-center">
                            <FaLink className="w-5 h-5 text-white/15" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">URL Not Found</h2>
                        <p className="text-white/35 text-sm mb-2">The requested URL mapping could not be found.</p>
                        {errorMessage && <p className="text-sm text-red-400 mb-6">{errorMessage}</p>}
                        <Button onClick={() => navigate(routes.urlMappings)} size="sm">Back to My URLs</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] bg-grid-dark md:min-h-[calc(100vh-96px)]">
            <AccountSidebar />

            <div className="flex-grow md:ml-64 px-4 pt-3 pb-10 sm:px-6 md:px-10 md:py-8">
                <div className="max-w-4xl mx-auto">

                    {/* Back + header */}
                    <div className="mb-8 mt-3 md:mt-0">
                        <button
                            onClick={() => navigate(routes.urlMappings)}
                            className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-sm mb-5 transition-colors group"
                        >
                            <FaArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                            Back to My URLs
                        </button>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <FaLink className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                        URL Details
                                    </h1>
                                    <p className="text-white/40 text-sm mt-0.5">{getDomain(urlMapping.originalUrl)}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="group relative inline-flex">
                                    <Button variant="secondary" size="sm" disabled className="border-dashed opacity-40">
                                        <FaLock className="w-3 h-3" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </Button>
                                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0d0f1e] px-2.5 py-1.5 text-xs text-white/55 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 z-20">
                                        Coming soon
                                    </div>
                                </div>
                                <Button onClick={() => setShowDeleteModal(true)} variant="danger" size="sm">
                                    <FaTrash className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* Left: URL info */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-white/[0.06]">
                                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">URL Information</p>
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* Short URL */}
                                    <div>
                                        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Short URL</label>
                                        <div className="flex items-center gap-2 bg-[#0a1220] border border-blue-500/15 rounded-xl px-4 py-3">
                                            <a
                                                href={urlMapping.shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-blue-400 hover:text-blue-300 break-all transition-colors"
                                                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                                            >
                                                {urlMapping.shortUrl}
                                            </a>
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    onClick={() => handleCopyUrl(urlMapping.shortUrl)}
                                                    className="p-2 text-white/30 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Copy"
                                                >
                                                    {copiedUrl === urlMapping.shortUrl
                                                        ? <FaCheck className="w-3.5 h-3.5 text-blue-400" />
                                                        : <FaCopy className="w-3.5 h-3.5" />}
                                                </button>
                                                <a
                                                    href={urlMapping.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-white/30 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                                >
                                                    <FaExternalLinkAlt className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Original URL */}
                                    <div>
                                        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Original URL</label>
                                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                                            <a
                                                href={urlMapping.originalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-white/50 hover:text-white/80 break-all transition-colors"
                                                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                                            >
                                                {urlMapping.originalUrl}
                                            </a>
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    onClick={() => handleCopyUrl(urlMapping.originalUrl)}
                                                    className="p-2 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all"
                                                    title="Copy"
                                                >
                                                    {copiedUrl === urlMapping.originalUrl
                                                        ? <FaCheck className="w-3.5 h-3.5 text-white/60" />
                                                        : <FaCopy className="w-3.5 h-3.5" />}
                                                </button>
                                                <a
                                                    href={urlMapping.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all"
                                                >
                                                    <FaExternalLinkAlt className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Details */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-white/[0.06]">
                                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Details</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                        <div className="w-8 h-8 bg-blue-600/15 border border-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FaCalendarAlt className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">Created</p>
                                            <p className="text-xs font-semibold text-white/80" style={{ fontFamily: 'var(--font-mono)' }}>
                                                {formatDate(urlMapping.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {urlMapping.expirationDate && (
                                        <div className="flex items-center gap-3 p-3 bg-amber-900/15 border border-amber-500/15 rounded-xl">
                                            <div className="w-8 h-8 bg-amber-500/15 border border-amber-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FaClock className="w-3.5 h-3.5 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">Expires</p>
                                                <p className="text-xs font-semibold text-amber-300/80" style={{ fontFamily: 'var(--font-mono)' }}>
                                                    {formatDate(urlMapping.expirationDate)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl opacity-40 cursor-not-allowed">
                                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FaQrcode className="w-3.5 h-3.5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">QR Code</p>
                                            <p className="text-xs text-white/40">Coming soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete URL?"
                message="This short link will stop working immediately and cannot be restored."
                confirmLabel="Delete"
                isLoading={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default UrlMappingDetailsPage;
