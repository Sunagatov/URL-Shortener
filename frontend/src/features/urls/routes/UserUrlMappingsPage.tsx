import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { routes } from '@/app/routes';
import { deleteUrl, getUserUrls } from '@/features/urls/api/urlsApi';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/apiErrors';
import { Button } from '@/shared/ui';
import type { UrlMapping } from '@/shared/types';
import {
    FaTrash,
    FaInfoCircle,
    FaLink,
    FaExternalLinkAlt,
    FaCopy,
    FaChevronLeft,
    FaChevronRight,
    FaPlus,
} from 'react-icons/fa';

export const getVisiblePages = (page: number, totalPages: number, maxVisiblePages = 5) => {
    const startPage = Math.max(
        0,
        Math.min(page - Math.floor(maxVisiblePages / 2), Math.max(0, totalPages - maxVisiblePages))
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages);
    return Array.from({ length: endPage - startPage }, (_, index) => startPage + index);
};

const getDomainLabel = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch { return url.slice(0, 20); }
};

const UrlCard: React.FC<{
    mapping: UrlMapping;
    index: number;
    onCopy: (url: string) => void;
    copiedUrl: string | null;
    onDetails: () => void;
    onDelete: () => void;
    formatDate: (d: string) => string;
}> = ({ mapping, index, onCopy, copiedUrl, onDetails, onDelete, formatDate }) => {
    const domain = getDomainLabel(mapping.originalUrl);
    const shortSlug = mapping.shortUrl.split('/').pop() ?? mapping.shortUrl;

    return (
        <div className="group rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.06] transition-all duration-200 overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-3.5 flex items-center gap-3 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FaLink className="w-3 h-3 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white/50">#{index}</span>
                        <span className="text-xs text-white/25">·</span>
                        <span className="text-xs text-white/45 truncate">{domain}</span>
                    </div>
                    <p className="text-xs text-white/25 mt-0.5">{formatDate(mapping.createdAt)}</p>
                </div>
            </div>

            {/* URLs */}
            <div className="px-5 py-4 space-y-3">
                {/* Short URL row */}
                <div>
                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5">Short URL</p>
                    <div className="flex items-center gap-2 bg-[#0a1220] rounded-xl px-3 py-2.5 border border-white/[0.06] group/row hover:border-blue-500/20 transition-colors">
                        <a
                            href={mapping.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-blue-400 hover:text-blue-300 text-sm truncate transition-colors"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                        >
                            …/{shortSlug}
                        </a>
                        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                                onClick={() => onCopy(mapping.shortUrl)}
                                className="p-1.5 text-white/30 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                title="Copy"
                            >
                                <FaCopy className="w-3 h-3" />
                            </button>
                            <a
                                href={mapping.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-white/30 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                title="Open"
                            >
                                <FaExternalLinkAlt className="w-3 h-3" />
                            </a>
                        </div>
                        {copiedUrl === mapping.shortUrl && (
                            <span className="text-[10px] text-blue-400 font-medium shrink-0">Copied!</span>
                        )}
                    </div>
                </div>

                {/* Original URL row */}
                <div>
                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5">Original URL</p>
                    <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.05] group/row hover:border-white/[0.10] transition-colors">
                        <a
                            href={mapping.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-white/45 hover:text-white/70 text-xs truncate transition-colors"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                            title={mapping.originalUrl}
                        >
                            {mapping.originalUrl}
                        </a>
                        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0">
                            <button
                                onClick={() => onCopy(mapping.originalUrl)}
                                className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all"
                                title="Copy"
                            >
                                <FaCopy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {mapping.expirationDate && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/15 border border-amber-500/15 rounded-xl">
                        <span className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-widest">Expires</span>
                        <span className="text-xs text-amber-300/70 ml-auto" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            {formatDate(mapping.expirationDate)}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06] flex gap-2">
                <Button onClick={onDetails} variant="secondary" size="sm" className="flex-1 justify-center">
                    <FaInfoCircle className="w-3 h-3" />
                    <span>Details</span>
                </Button>
                <Button onClick={onDelete} variant="danger" size="sm" title="Delete URL">
                    <FaTrash className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
};

const UserUrlMappingsPage: React.FC = () => {
    const [urlMappings, setUrlMappings] = useState<UrlMapping[]>([]);
    const [page, setPage] = useState(0);
    const size = 6;
    const [totalPages, setTotalPages]       = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [errorMessage, setErrorMessage]   = useState('');
    const [isLoading, setIsLoading]         = useState(true);
    const [copiedUrl, setCopiedUrl]         = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchUrlMappings = useCallback(async (pageNumber: number) => {
        try {
            setIsLoading(true);
            const data = await getUserUrls(pageNumber, size);
            setUrlMappings(data.content);
            setPage(data.page);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) {
                navigate(routes.signIn, { replace: true });
                return;
            }
            setErrorMessage(getApiErrorMessage(error, 'Failed to fetch URL mappings.'));
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => { void fetchUrlMappings(page); }, [fetchUrlMappings, page]);

    const handleDelete = async (urlHash: string) => {
        if (!window.confirm('Delete this URL mapping?')) return;
        try {
            await deleteUrl(urlHash);
            const nextPage = urlMappings.length === 1 && page > 0 ? page - 1 : page;
            await fetchUrlMappings(nextPage);
            setErrorMessage('');
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) { navigate(routes.signIn, { replace: true }); return; }
            setErrorMessage(getApiErrorMessage(error, 'Failed to delete URL mapping.'));
        }
    };

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (err) { console.error('Failed to copy URL:', err); }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] md:min-h-[calc(100vh-96px)]">
                <AccountSidebar />
                <div className="flex-grow md:ml-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                        <p className="text-white/30 text-sm">Loading your URLs…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] bg-grid-dark md:min-h-[calc(100vh-96px)]">
            <AccountSidebar />
            <div className="flex-grow md:ml-64 px-4 pt-3 pb-10 sm:px-6 md:px-10 md:py-8">
                <div className="mx-auto flex min-h-full max-w-6xl flex-col">

                    {/* Header */}
                    <div className="mb-8 mt-3 md:mt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                My URLs
                            </h1>
                            <p className="text-white/40 text-sm mt-0.5">Manage and track your shortened links</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {totalElements > 0 && (
                                <span className="text-xs text-white/35 hidden sm:block">
                                    {totalElements} link{totalElements !== 1 ? 's' : ''}
                                </span>
                            )}
                            <Button onClick={() => navigate(routes.home)} variant="primary" size="sm">
                                <FaPlus className="w-3.5 h-3.5" />
                                <span>New URL</span>
                            </Button>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    {/* URL Cards Grid */}
                    {urlMappings.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                            {urlMappings.map((mapping, index) => (
                                <UrlCard
                                    key={mapping.urlHash}
                                    mapping={mapping}
                                    index={index + 1 + page * size}
                                    onCopy={handleCopyUrl}
                                    copiedUrl={copiedUrl}
                                    onDetails={() => navigate(`/account/url-mappings/${mapping.urlHash}`)}
                                    onDelete={() => handleDelete(mapping.urlHash)}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-1 items-start justify-center pt-4 sm:items-center sm:pt-0">
                            <div className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] px-6 py-14 sm:max-w-md text-center">
                                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.04] flex items-center justify-center">
                                    <FaLink className="w-5 h-5 text-white/15" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No URLs yet</h3>
                                <p className="text-sm text-white/35 mb-6 leading-relaxed">
                                    Shorten your first link and start tracking clicks.
                                </p>
                                <Button onClick={() => navigate(routes.home)} size="sm" className="mx-auto">
                                    <FaPlus className="w-3.5 h-3.5" />
                                    Create Short URL
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-2xl px-5 py-4 gap-4 mt-auto">
                            <p className="text-xs text-white/35">
                                Showing{' '}
                                <span className="text-white font-semibold">{page * size + 1}–{Math.min((page + 1) * size, totalElements)}</span>
                                {' '}of{' '}
                                <span className="text-white font-semibold">{totalElements}</span>
                            </p>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    variant="secondary"
                                    size="sm"
                                >
                                    <FaChevronLeft className="w-3 h-3" />
                                </Button>
                                {getVisiblePages(page, totalPages).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                            pageNum === page
                                                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                                : 'bg-white/[0.06] text-white/45 hover:bg-white/[0.10] hover:text-white'
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                ))}
                                <Button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    variant="secondary"
                                    size="sm"
                                >
                                    <FaChevronRight className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserUrlMappingsPage;
