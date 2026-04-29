import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import SidePanel from './SidePanel';
import { Button } from './ui';
import type { UrlMapping } from '../types';
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

const UserUrlMappings: React.FC = () => {
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
            const data = await ApiService.getUserUrls(pageNumber, size);
            setUrlMappings(data.content);
            setPage(data.page);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                navigate('/signin');
            } else {
                setErrorMessage('Failed to fetch URL mappings.');
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
            await ApiService.deleteUrl(urlHash);

            const shouldGoBackOnePage = urlMappings.length === 1 && page > 0;
            const nextPage = shouldGoBackOnePage ? page - 1 : page;

            await fetchUrlMappings(nextPage);
            setErrorMessage('');
        } catch {
            setErrorMessage('Failed to delete URL mapping.');
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
            <div className="flex min-h-screen bg-gray-50">
                <SidePanel />
                <div className="flex-grow md:ml-72 p-8">
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <SidePanel />
            <div className="flex-grow md:ml-72 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My URL Mappings</h1>
                        <p className="text-gray-600">Manage and track your shortened URLs</p>
                        {totalElements > 0 && (
                            <div className="mt-4 flex items-center space-x-2">
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {totalElements} Total URLs
                                </div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Page {page + 1} of {totalPages}
                                </div>
                            </div>
                        )}
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    {/* URL Cards Grid */}
                    {urlMappings.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {urlMappings.map((mapping, index) => (
                                <div
                                    key={mapping.urlHash}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                                >
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FaLink className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">URL #{index + 1 + page * size}</h3>
                                                    <p className="text-sm text-gray-500 flex items-center">
                                                        <FaCalendarAlt className="w-3 h-3 mr-1" />
                                                        Created {formatDate(mapping.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Short URL */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">Short URL</label>
                                            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <a
                                                    href={mapping.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-green-700 hover:text-green-800 font-medium truncate"
                                                >
                                                    {mapping.shortUrl}
                                                </a>
                                                <Button
                                                    onClick={() => handleCopyUrl(mapping.shortUrl)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100"
                                                    title="Copy short URL"
                                                >
                                                    <FaCopy className="w-4 h-4" />
                                                </Button>
                                                <a
                                                    href={mapping.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                                    title="Open short URL"
                                                >
                                                    <FaExternalLinkAlt className="w-4 h-4" />
                                                </a>
                                            </div>
                                            {copiedUrl === mapping.shortUrl && (
                                                <p className="text-xs text-green-600 mt-1">✓ Copied to clipboard!</p>
                                            )}
                                        </div>

                                        {/* Original URL */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">Original URL</label>
                                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <a
                                                    href={mapping.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-gray-700 hover:text-gray-800 truncate"
                                                    title={mapping.originalUrl}
                                                >
                                                    {truncateUrl(mapping.originalUrl, 50)}
                                                </a>
                                                <Button
                                                    onClick={() => handleCopyUrl(mapping.originalUrl)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                                    title="Copy original URL"
                                                >
                                                    <FaCopy className="w-4 h-4" />
                                                </Button>
                                                <a
                                                    href={mapping.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Open original URL"
                                                >
                                                    <FaExternalLinkAlt className="w-4 h-4" />
                                                </a>
                                            </div>
                                            {copiedUrl === mapping.originalUrl && (
                                                <p className="text-xs text-green-600 mt-1">✓ Copied to clipboard!</p>
                                            )}
                                        </div>

                                        {/* Expiration Date */}
                                        {mapping.expirationDate && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Expires</label>
                                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                    <p className="text-orange-700 text-sm font-medium">
                                                        {formatDate(mapping.expirationDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Actions */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex space-x-3">
                                        <Button
                                            onClick={() => navigate(`/account/url-mappings/${mapping.urlHash}`)}
                                            className="flex-1"
                                        >
                                            <FaInfoCircle className="w-4 h-4" />
                                            <span>Details</span>
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(mapping.urlHash)}
                                            variant="danger"
                                            title="Delete URL"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaLink className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No URL mappings found</h3>
                            <p className="text-gray-500 mb-6">Start by creating your first shortened URL</p>
                            <Button onClick={() => navigate('/')}>
                                Create Short URL
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Showing</span>
                                <span className="font-medium text-gray-900">
                                    {page * size + 1}-{Math.min((page + 1) * size, totalElements)}
                                </span>
                                <span>of</span>
                                <span className="font-medium text-gray-900">{totalElements}</span>
                                <span>results</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={handlePreviousPage}
                                    disabled={page === 0}
                                    variant={page === 0 ? 'secondary' : 'primary'}
                                >
                                    <FaChevronLeft className="w-4 h-4" />
                                    <span>Previous</span>
                                </Button>

                                <div className="flex items-center space-x-1">
                                    {getVisiblePages(page, totalPages).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                                pageNum === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    onClick={handleNextPage}
                                    disabled={page >= totalPages - 1}
                                    variant={page >= totalPages - 1 ? 'secondary' : 'primary'}
                                >
                                    <span>Next</span>
                                    <FaChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserUrlMappings;
