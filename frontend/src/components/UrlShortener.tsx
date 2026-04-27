import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { createUrlSchema, type CreateUrlFormData } from '../utils/validation';
import type { UrlMapping } from '../types';
import { ROUTES } from '../constants';
import { Button, Card, Input } from './ui';
import {
    FaLink,
    FaCopy,
    FaExternalLinkAlt,
    FaCheck,
    FaRocket,
    FaShieldAlt,
    FaChartLine,
    FaQrcode,
    FaArrowRight,
    FaGlobe
} from 'react-icons/fa';

const UrlShortener: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { execute, loading, error } = useApi<UrlMapping>();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateUrlFormData>({
        resolver: zodResolver(createUrlSchema),
    });

    const [shortUrl, setShortUrl] = React.useState<string>('');
    const [copied, setCopied] = React.useState(false);

    const onSubmit = async (data: CreateUrlFormData) => {
        const result = await execute(() => ApiService.createUrl(data));
        if (result) {
            setShortUrl(result.shortUrl);
        }
    };

    const handleClear = () => {
        reset();
        setShortUrl('');
        setCopied(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const features = [
        {
            icon: FaRocket,
            title: 'Lightning Fast',
            description: 'Create short URLs in seconds with our optimized platform'
        },
        {
            icon: FaShieldAlt,
            title: 'Secure & Reliable',
            description: 'Your links are protected with enterprise-grade security'
        },
        {
            icon: FaChartLine,
            title: 'Analytics & Insights',
            description: 'Track clicks, analyze traffic, and measure performance'
        },
        {
            icon: FaQrcode,
            title: 'QR Code Generation',
            description: 'Generate QR codes for easy mobile sharing'
        }
    ];

    const stats = [
        { number: '10M+', label: 'URLs Shortened' },
        { number: '500K+', label: 'Happy Users' },
        { number: '99.9%', label: 'Uptime' },
        { number: '24/7', label: 'Support' }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Shorten URLs with
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                            Style & Analytics
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Transform long, complex URLs into short, memorable links. 
                        Track performance, analyze clicks, and share with confidence.
                    </p>
                </div>

                {/* URL Shortener Form */}
                <div className="max-w-2xl mx-auto mb-12">
                    <Card className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <Input
                                {...register('originalUrl')}
                                type="url"
                                placeholder="Paste your long URL here..."
                                icon={<FaGlobe className="h-5 w-5 text-gray-400" />}
                                error={errors.originalUrl?.message}
                                className="text-lg py-4 bg-gray-50 focus:bg-white"
                            />

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    size="lg"
                                    className="flex-1"
                                >
                                    <FaLink className="w-5 h-5" />
                                    <span>{loading ? 'Shortening...' : 'Shorten URL'}</span>
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={loading}
                                    variant="secondary"
                                    size="lg"
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center">
                                <span className="mr-2">❌</span>
                                <p className="text-sm">{error.errorMessage}</p>
                            </div>
                        )}

                        {/* Success Result */}
                        {shortUrl && (
                            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <FaCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
                                        <p className="text-sm text-gray-600">Your short URL is ready to use</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <a
                                            href={shortUrl}
                                            className="text-blue-600 hover:text-blue-800 font-medium break-all flex-1 mr-4"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {shortUrl}
                                        </a>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleCopy}
                                                className={`p-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                                                    copied 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                }`}
                                                title="Copy to clipboard"
                                            >
                                                {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                                                <span className="text-sm font-medium hidden sm:inline">
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </span>
                                            </button>
                                            <a
                                                href={shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200"
                                                title="Open link"
                                            >
                                                <FaExternalLinkAlt className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {isAuthenticated && (
                                    <div className="mt-4 text-center">
                                        <Link
                                            to={ROUTES.URL_MAPPINGS}
                                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                        >
                                            <span>View in Dashboard</span>
                                            <FaArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Call to Action for Non-Authenticated Users */}
                {!isAuthenticated && (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
                        <h3 className="text-2xl font-bold mb-4">Want more features?</h3>
                        <p className="text-blue-100 mb-6">Sign up for free to track analytics, manage your URLs, and access advanced features!</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={ROUTES.SIGNUP}>
                                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                                    Sign Up Free
                                </Button>
                            </Link>
                            <Link to={ROUTES.SIGNIN}>
                                <Button variant="ghost">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Features Section */}
            <div className="mb-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Shorty URL?</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Powerful features designed to make link management simple and effective
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={index} hover className="p-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-8 md:p-12 text-white">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Millions</h2>
                    <p className="text-blue-100 text-lg">Join thousands of users who trust Shorty URL for their link management needs</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-300 mb-2">{stat.number}</div>
                            <div className="text-blue-100">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UrlShortener;
