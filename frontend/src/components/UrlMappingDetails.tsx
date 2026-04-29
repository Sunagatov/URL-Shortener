import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import SidePanel from './SidePanel';
import { Button } from './ui';
import type { UrlMapping } from '../types';
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

const UrlMappingDetails: React.FC = () => {
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
                const response = await ApiService.getUrlDetails(urlHash);
                setUrlMapping(response);
            } catch (error: any) {
                if (error.response && error.response.status === 401) {
                    navigate('/signin');
                } else {
                    setErrorMessage('Failed to fetch URL mapping details.');
                }
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
            await ApiService.deleteUrl(urlMapping.urlHash);
            navigate('/account/url-mappings');
        } catch (error: any) {
            setErrorMessage('Failed to delete URL mapping.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDomainFromUrl = (url: string) => {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
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

    if (!urlMapping) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <SidePanel />
                <div className="flex-grow md:ml-72 p-8">
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">URL Not Found</h2>
                        <p className="text-gray-600 mb-6">The requested URL mapping could not be found.</p>
                        <Button onClick={() => navigate('/account/url-mappings')}>
                            Back to URL Mappings
                        </Button>
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
                        <button
                            onClick={() => navigate('/account/url-mappings')}
                            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                        >
                            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to URL Mappings
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">URL Details</h1>
                        <p className="text-gray-600">Manage and view your shortened URL information</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 relative">
                            <div className="flex flex-col md:flex-row items-start justify-between">
                                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                                        <FaLink className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Shortened URL</h2>
                                        <p className="text-blue-100">{getDomainFromUrl(urlMapping.originalUrl)}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled
                                        title="URL editing is not implemented yet"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                        <span className="hidden sm:inline">Edit (coming soon)</span>
                                    </Button>
                                    <Button 
                                        onClick={handleDelete}
                                        variant="danger"
                                        size="sm"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                        <span className="hidden sm:inline">Delete</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* URLs Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">URL Information</h3>
                                    
                                    {/* Short URL */}
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-500 mb-3">Short URL</label>
                                        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FaLink className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href={urlMapping.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-700 hover:text-green-800 font-medium break-all"
                                                >
                                                    {urlMapping.shortUrl}
                                                </a>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleCopyUrl(urlMapping.shortUrl)}
                                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                                                    title="Copy short URL"
                                                >
                                                    <FaCopy className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={urlMapping.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                                                    title="Open short URL"
                                                >
                                                    <FaExternalLinkAlt className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                        {copiedUrl === urlMapping.shortUrl && (
                                            <p className="text-xs text-green-600 mt-2 flex items-center">
                                                <span className="mr-1">✓</span> Copied to clipboard!
                                            </p>
                                        )}
                                    </div>

                                    {/* Original URL */}
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-500 mb-3">Original URL</label>
                                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FaExternalLinkAlt className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href={urlMapping.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-700 hover:text-blue-800 font-medium break-all"
                                                >
                                                    {urlMapping.originalUrl}
                                                </a>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleCopyUrl(urlMapping.originalUrl)}
                                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                                    title="Copy original URL"
                                                >
                                                    <FaCopy className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={urlMapping.originalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                                    title="Open original URL"
                                                >
                                                    <FaExternalLinkAlt className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                        {copiedUrl === urlMapping.originalUrl && (
                                            <p className="text-xs text-green-600 mt-2 flex items-center">
                                                <span className="mr-1">✓</span> Copied to clipboard!
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Details & Analytics</h3>
                                    
                                    {/* Created Date */}
                                    <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <FaCalendarAlt className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                                            <p className="text-lg font-semibold text-gray-900">{formatDate(urlMapping.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Expiration Date */}
                                    {urlMapping.expirationDate && (
                                        <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <FaClock className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Expires</p>
                                                <p className="text-lg font-semibold text-gray-900">{formatDate(urlMapping.expirationDate)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* QR Code */}
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 opacity-60 cursor-not-allowed">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <FaQrcode className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-500 mb-1">QR Code</p>
                                            <p className="text-sm text-gray-700">QR code generation is coming soon</p>
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

export default UrlMappingDetails;
