import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { routes } from '@/app/routes';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { deleteUrl, getUserUrls } from '@/features/urls/api/urlsApi';
import { useClipboard } from '@/shared/lib/useClipboard';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/apiErrors';
import { Button, useToast } from '@/shared/ui';
import type { UrlMapping } from '@/shared/types';
import {
    FaTrash,
    FaLink,
    FaExternalLinkAlt,
    FaCopy,
    FaChevronLeft,
    FaChevronRight,
    FaPlus,
    FaSearch,
    FaTimes,
    FaSortAmountDown,
    FaSortAmountUp,
} from 'react-icons/fa';

const PAGE_SIZE = 6;

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
    onCopy: (url: string, e: React.MouseEvent) => void;
    copiedUrl: string | null;
    onDetails: () => void;
    onDelete: (e: React.MouseEvent) => void;
    isDeleting: boolean;
    formatDate: (d: string) => string;
}> = ({ mapping, index, onCopy, copiedUrl, onDetails, onDelete, isDeleting, formatDate }) => {
    const domain = getDomainLabel(mapping.originalUrl);
    const shortSlug = mapping.shortUrl.split('/').pop() ?? mapping.shortUrl;

    return (
        <div
            onClick={onDetails}
            className="group cursor-pointer rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:border-blue-500/25 hover:bg-white/[0.055] transition-all duration-200 overflow-hidden"
        >
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
                <FaChevronRight className="w-3 h-3 text-white/15 group-hover:text-white/40 transition-colors flex-shrink-0" />
            </div>

            {/* URLs */}
            <div className="px-5 py-4 space-y-3">
                {/* Short URL row */}
                <div>
                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5">Short URL</p>
                    <div className="flex items-center gap-2 bg-[#0a1220] rounded-xl px-3 py-2.5 border border-white/[0.06] group/row hover:border-blue-500/20 transition-colors">
                        <span
                            className="flex-1 text-blue-400 text-sm truncate"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                        >
                            …/{shortSlug}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                                onClick={e => onCopy(mapping.shortUrl, e)}
                                className="p-1.5 text-white/30 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                title="Copy"
                            >
                                {copiedUrl === mapping.shortUrl
                                    ? <FaChevronRight className="w-3 h-3 text-blue-400" />
                                    : <FaCopy className="w-3 h-3" />}
                            </button>
                            <a
                                href={mapping.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
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
                        <span
                            className="flex-1 text-white/45 text-xs truncate"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                            title={mapping.originalUrl}
                        >
                            {mapping.originalUrl}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0">
                            <button
                                onClick={e => onCopy(mapping.originalUrl, e)}
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
            <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06] flex justify-end">
                <Button
                    onClick={onDelete}
                    variant="secondary"
                    size="sm"
                    title="Delete URL"
                    loading={isDeleting}
                    className="text-red-400/40 hover:text-red-300 hover:bg-red-900/20 hover:border-red-500/20"
                >
                    {!isDeleting && <FaTrash className="w-3 h-3" />}
                    <span>{isDeleting ? 'Deleting…' : 'Delete'}</span>
                </Button>
            </div>
        </div>
    );
};

const UserUrlMappingsPage: React.FC = () => {
    usePageTitle('My URLs');

    // Server-paged state
    const [urlMappings, setUrlMappings]     = useState<UrlMapping[]>([]);
    const [serverPage, setServerPage]       = useState(0);
    const [totalPages, setTotalPages]       = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading]         = useState(true);

    // Search + sort state
    const [search, setSearch]               = useState('');
    const [sortOrder, setSortOrder]         = useState<'newest' | 'oldest'>('newest');

    // All mappings for search mode (fetch-once)
    const [allMappings, setAllMappings]     = useState<UrlMapping[]>([]);
    const [allLoaded, setAllLoaded]         = useState(false);
    const [clientPage, setClientPage]       = useState(0);
    const [pageError, setPageError]         = useState<string | null>(null);

    // Copy + delete state
    const [deletingHash, setDeletingHash]   = useState<string | null>(null);

    const navigate = useNavigate();
    const toast = useToast();
    const { copiedValue, copyValue } = useClipboard();
    const redirectToSignIn = useCallback(() => {
        navigate(routes.signIn, { replace: true });
    }, [navigate]);

    const fetchPage = useCallback(async (pageNumber: number) => {
        try {
            setIsLoading(true);
            const data = await getUserUrls(pageNumber, PAGE_SIZE);
            setUrlMappings(data.content);
            setServerPage(data.page);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
            setPageError(null);
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) {
                redirectToSignIn();
                return;
            }
            const message = getApiErrorMessage(error, 'Failed to fetch URL mappings.');
            setPageError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [redirectToSignIn, toast]);

    const fetchAll = useCallback(async () => {
        try {
            const data = await getUserUrls(0, 500);
            setAllMappings(data.content);
            setAllLoaded(true);
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) {
                redirectToSignIn();
            }
        }
    }, [redirectToSignIn]);

    useEffect(() => { void fetchPage(0); }, [fetchPage]);

    // When user starts searching, load all URLs once
    useEffect(() => {
        if (search.trim() && !allLoaded) { void fetchAll(); }
        setClientPage(0);
    }, [search, allLoaded, fetchAll]);

    const isSearchMode = search.trim().length > 0;

    const filteredAndSorted = useMemo(() => {
        const source = isSearchMode ? allMappings : urlMappings;
        const q = search.toLowerCase().trim();
        const filtered = isSearchMode
            ? source.filter(m =>
                m.originalUrl.toLowerCase().includes(q) ||
                m.shortUrl.toLowerCase().includes(q)
              )
            : source;
        if (sortOrder === 'oldest') {
            return [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
        return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [isSearchMode, allMappings, urlMappings, search, sortOrder]);

    const clientTotalPages  = Math.ceil(filteredAndSorted.length / PAGE_SIZE);
    const displayMappings   = isSearchMode
        ? filteredAndSorted.slice(clientPage * PAGE_SIZE, (clientPage + 1) * PAGE_SIZE)
        : filteredAndSorted;
    const displayTotalPages = isSearchMode ? clientTotalPages : totalPages;
    const displayPage       = isSearchMode ? clientPage : serverPage;
    const displayTotal      = isSearchMode ? filteredAndSorted.length : totalElements;

    const handlePageChange = (p: number) => {
        if (isSearchMode) { setClientPage(p); }
        else {
            setServerPage(p);
            void fetchPage(p);
        }
    };

    const deleteMapping = async (urlHash: string) => {
        if (!window.confirm('This short link will stop working immediately and cannot be restored.')) {
            return;
        }

        setDeletingHash(urlHash);
        try {
            await deleteUrl(urlHash);
            toast.success('URL deleted successfully.');
            setPageError(null);
            if (isSearchMode) {
                setAllMappings(prev => prev.filter(m => m.urlHash !== urlHash));
            } else {
                const nextPage = urlMappings.length === 1 && serverPage > 0 ? serverPage - 1 : serverPage;
                await fetchPage(nextPage);
            }
            setTotalElements(prev => prev - 1);
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) {
                redirectToSignIn();
                return;
            }
            const message = getApiErrorMessage(error, 'Failed to delete URL mapping.');
            setPageError(message);
            toast.error(message);
        } finally {
            setDeletingHash(null);
        }
    };

    const handleCopyUrl = async (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const didCopy = await copyValue(url);
        if (!didCopy) {
            toast.error('Unable to copy URL.');
            return;
        }
        toast.success('Copied to clipboard');
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
                    <div className="mb-5 mt-3 md:mt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                My URLs
                            </h1>
                            <p className="text-white/40 text-sm mt-0.5">Manage and track your shortened links</p>
                        </div>
                        <Button onClick={() => { navigate(routes.home); }} variant="primary" size="sm">
                            <FaPlus className="w-3.5 h-3.5" />
                            <span>New URL</span>
                        </Button>
                    </div>

                    {/* Toolbar: search + sort + count */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-2.5">
                        {/* Search input */}
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by original or short URL…"
                                className="w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/25 transition-all"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    <FaTimes className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Sort toggle */}
                        <button
                            onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.07] text-white/55 hover:text-white/80 rounded-xl text-sm transition-all whitespace-nowrap"
                        >
                            {sortOrder === 'newest'
                                ? <FaSortAmountDown className="w-3.5 h-3.5" />
                                : <FaSortAmountUp className="w-3.5 h-3.5" />}
                            {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                        </button>

                        {/* Count badge */}
                        {displayTotal > 0 && (
                            <div className="flex items-center px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                <span className="text-xs text-white/35 whitespace-nowrap">
                                    {isSearchMode
                                        ? `${displayTotal} result${displayTotal !== 1 ? 's' : ''}`
                                        : `${totalElements} link${totalElements !== 1 ? 's' : ''}`}
                                </span>
                            </div>
                        )}
                    </div>

                    {pageError && (
                        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-900/15 px-4 py-3 text-sm text-red-300">
                            {pageError}
                        </div>
                    )}

                    {/* URL Cards Grid */}
                    {displayMappings.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                            {displayMappings.map((mapping, index) => (
                                <UrlCard
                                    key={mapping.urlHash}
                                    mapping={mapping}
                                    index={displayPage * PAGE_SIZE + index + 1}
                                    onCopy={handleCopyUrl}
                                    copiedUrl={copiedValue}
                                    onDetails={() => { navigate(`/account/url-mappings/${mapping.urlHash}`); }}
                                    onDelete={e => { e.stopPropagation(); void deleteMapping(mapping.urlHash); }}
                                    isDeleting={deletingHash === mapping.urlHash}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    ) : isSearchMode ? (
                        /* No search results */
                        <div className="flex flex-1 items-start justify-center pt-4 sm:items-center sm:pt-0">
                            <div className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] px-6 py-14 sm:max-w-md text-center">
                                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.04] flex items-center justify-center">
                                    <FaSearch className="w-5 h-5 text-white/15" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No results</h3>
                                <p className="text-sm text-white/35 mb-6 leading-relaxed">
                                    No URLs match "<span className="text-white/55">{search}</span>"
                                </p>
                                <Button onClick={() => { setSearch(''); }} variant="secondary" size="sm" className="mx-auto">
                                    <FaTimes className="w-3.5 h-3.5" />
                                    Clear search
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="flex flex-1 items-start justify-center pt-4 sm:items-center sm:pt-0">
                            <div className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.07] px-6 py-14 sm:max-w-md text-center">
                                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.04] flex items-center justify-center">
                                    <FaLink className="w-5 h-5 text-white/15" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No URLs yet</h3>
                                <p className="text-sm text-white/35 mb-6 leading-relaxed">
                                    Shorten your first link and start tracking clicks.
                                </p>
                                <Button onClick={() => { navigate(routes.home); }} size="sm" className="mx-auto">
                                    <FaPlus className="w-3.5 h-3.5" />
                                    Create Short URL
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {displayTotalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-2xl px-5 py-4 gap-4 mt-auto">
                            <p className="text-xs text-white/35">
                                Showing{' '}
                                <span className="text-white font-semibold">
                                    {displayPage * PAGE_SIZE + 1}–{Math.min((displayPage + 1) * PAGE_SIZE, displayTotal)}
                                </span>
                                {' '}of{' '}
                                <span className="text-white font-semibold">{displayTotal}</span>
                            </p>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    onClick={() => handlePageChange(Math.max(0, displayPage - 1))}
                                    disabled={displayPage === 0}
                                    variant="secondary"
                                    size="sm"
                                >
                                    <FaChevronLeft className="w-3 h-3" />
                                </Button>
                                {getVisiblePages(displayPage, displayTotalPages).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                            pageNum === displayPage
                                                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                                : 'bg-white/[0.06] text-white/45 hover:bg-white/[0.10] hover:text-white'
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                ))}
                                <Button
                                    onClick={() => handlePageChange(Math.min(displayTotalPages - 1, displayPage + 1))}
                                    disabled={displayPage >= displayTotalPages - 1}
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
