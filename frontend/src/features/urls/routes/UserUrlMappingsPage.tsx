import React, { useEffect, useState } from 'react';
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
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';

export const getVisiblePages = (page: number, totalPages: number, maxVisiblePages = 5) => {
    const startPage = Math.max(
        0,
        Math.min(page - Math.floor(maxVisiblePages / 2), Math.max(0, totalPages - maxVisiblePages))
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages);

    return Array.from({ length: endPage - startPage }, (_, index) => startPage + index);
};

const UserUrlMappingsPage: React.FC = () => {
    const [urlMappings, setUrlMappings] = useState<UrlMapping[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(6);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchUrlMappings = async (pageNumber: number) => {
        try {
            setIsLoading(true);
            const data = await getUserUrls(pageNumber, size);
            setUrlMappings(data.content);
            setPage(data.page);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) {
                navigate(routes.signIn);
            } else {
                setErrorMessage(getApiErrorMessage(error, 'Failed to fetch URL mappings.'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUrlMappings(page);
    }, [page]);

    const handleDelete = async (urlHash: string) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this URL mapping?'
        );
        if (!confirmDelete) return;

        try {
            await deleteUrl(urlHash);

            const shouldGoBackOnePage = urlMappings.length === 1 && page > 0;
            const nextPage = shouldGoBackOnePage ? page - 1 : page;

            await fetchUrlMappings(nextPage);
            setErrorMessage('');
        } catch (error: unknown) {
            if (getApiErrorStatus(error) === 401) {
                navigate(routes.signIn);
                return;
            }

            setErrorMessage(getApiErrorMessage(error, 'Failed to delete URL mapping.'));
        }
    };

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (error) {
            console.error('Failed to copy URL:', error);
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const truncateUrl = (url: string, maxLength: number = 40) => {
        return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
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

    return (
        <div className="flex min-h-screen bg-[#060612] bg-grid-dark">
            <AccountSidebar />
            <div className="flex-grow md:ml-64 px-4 pt-3 pb-8 sm:px-6 md:px-10 md:py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 mt-3 md:mt-0">
                        <h1 className="text-3xl font-black text-white mb-1 tracking-tight">My URLs</h1>
                        <p className="text-white/45 text-sm">Manage and track your shortened URLs</p>
                        {totalElements > 0 && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="bg-blue-900/30 text-blue-400 border border-blue-500/25 px-3 py-1 rounded-full text-xs font-medium">
                                    {totalElements} Total URLs
                                </span>
                                <span className="bg-white/5 text-white/50 border border-white/10 px-3 py-1 rounded-full text-xs font-medium">
                                    Page {page + 1} of {totalPages}
                                </span>
                            </div>
                        )}
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    {/* URL Cards Grid */}
                    {urlMappings.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                            {urlMappings.map((mapping, index) => (
                                <div
                                    key={mapping.urlHash}
                                    className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                                >
                                    {/* Card Header */}
                                    <div className="bg-white/5 px-5 py-4 border-b border-white/10 flex items-center gap-3">
                                        <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/25 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FaLink className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">URL #{index + 1 + page * size}</p>
                                            <p className="text-xs text-white/35 flex items-center gap-1">
                                                <FaCalendarAlt className="w-2.5 h-2.5" />
                                                Created {formatDate(mapping.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 space-y-4">
                                        {/* Short URL */}
                                        <div>
                                            <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Short URL</label>
                                            <div className="flex items-center gap-2 p-3 bg-emerald-900/20 rounded-xl border border-emerald-500/25">
                                                <a
                                                    href={mapping.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-emerald-400 hover:text-emerald-300 font-medium truncate text-sm"
                                                >
                                                    {mapping.shortUrl}
                                                </a>
                                                <button
                                                    onClick={() => handleCopyUrl(mapping.shortUrl)}
                                                    className="p-1.5 text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-lg transition-colors"
                                                    title="Copy short URL"
                                                >
                                                    <FaCopy className="w-3.5 h-3.5" />
                                                </button>
                                                <a
                                                    href={mapping.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-lg transition-colors"
                                                    title="Open short URL"
                                                >
                                                    <FaExternalLinkAlt className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                            {copiedUrl === mapping.shortUrl && (
                                                <p className="text-xs text-emerald-400 mt-1">✓ Copied!</p>
                                            )}
                                        </div>

                                        {/* Original URL */}
                                        <div>
                                            <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Original URL</label>
                                            <div className="flex items-center gap-2 p-3 bg-blue-900/20 rounded-xl border border-blue-500/25">
                                                <a
                                                    href={mapping.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-blue-300 hover:text-blue-200 truncate text-sm"
                                                    title={mapping.originalUrl}
                                                >
                                                    {truncateUrl(mapping.originalUrl, 50)}
                                                </a>
                                                <button
                                                    onClick={() => handleCopyUrl(mapping.originalUrl)}
                                                    className="p-1.5 text-blue-300/70 hover:bg-blue-500/10 hover:text-blue-200 rounded-lg transition-colors"
                                                    title="Copy original URL"
                                                >
                                                    <FaCopy className="w-3.5 h-3.5" />
                                                </button>
                                                <a
                                                    href={mapping.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-blue-300/70 hover:bg-blue-500/10 hover:text-blue-200 rounded-lg transition-colors"
                                                    title="Open original URL"
                                                >
                                                    <FaExternalLinkAlt className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                            {copiedUrl === mapping.originalUrl && (
                                                <p className="text-xs text-emerald-400 mt-1">✓ Copied!</p>
                                            )}
                                        </div>

                                        {mapping.expirationDate && (
                                            <div>
                                                <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Expires</label>
                                                <div className="p-3 bg-amber-900/20 rounded-xl border border-amber-500/25">
                                                    <p className="text-amber-300 text-sm font-medium">{formatDate(mapping.expirationDate)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Actions */}
                                    <div className="px-5 py-4 bg-white/5 border-t border-white/10 flex gap-3">
                                        <Button
                                            onClick={() => navigate(`/account/url-mappings/${mapping.urlHash}`)}
                                            className="flex-1"
                                            size="sm"
                                        >
                                            <FaInfoCircle className="w-3.5 h-3.5" />
                                            <span>Details</span>
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(mapping.urlHash)}
                                            variant="danger"
                                            size="sm"
                                            title="Delete URL"
                                        >
                                            <FaTrash className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FaLink className="w-6 h-6 text-white/20" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No URLs yet</h3>
                            <p className="text-white/35 text-sm mb-6">Start by creating your first shortened URL</p>
                            <Button onClick={() => navigate(routes.home)} size="sm">
                                Create Short URL
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 gap-4">
                            <p className="text-xs text-white/40">
                                Showing <span className="text-white font-semibold">{page * size + 1}–{Math.min((page + 1) * size, totalElements)}</span> of <span className="text-white font-semibold">{totalElements}</span> results
                            </p>

                            <div className="flex items-center gap-2">
                                <Button onClick={handlePreviousPage} disabled={page === 0} variant={page === 0 ? 'secondary' : 'primary'} size="sm">
                                    <FaChevronLeft className="w-3 h-3" />
                                    <span>Prev</span>
                                </Button>

                                <div className="flex items-center gap-1">
                                    {getVisiblePages(page, totalPages).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                                                pageNum === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white/10 text-white/50 hover:bg-white/15 hover:text-white'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    ))}
                                </div>

                                <Button onClick={handleNextPage} disabled={page >= totalPages - 1} variant={page >= totalPages - 1 ? 'secondary' : 'primary'} size="sm">
                                    <span>Next</span>
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
