import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { createUrl } from '@/features/urls/api/urlsApi';
import { useApi } from '@/shared/api/useApi';
import { useAuth } from '@/shared/auth/useAuth';
import { createUrlSchema, type CreateUrlFormData } from '@/features/urls/model/urlValidation';
import { routes } from '@/app/routes';
import { Button } from '@/shared/ui';
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
    FaGlobe,
    FaBolt,
} from 'react-icons/fa';

const UrlShortenerPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { execute, loading, error } = useApi<{ shortUrl: string }>();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<z.input<typeof createUrlSchema>, unknown, CreateUrlFormData>({
        resolver: zodResolver(createUrlSchema),
    });

    const [shortUrl, setShortUrl] = React.useState('');
    const [copied, setCopied] = React.useState(false);

    const onSubmit = async (data: CreateUrlFormData) => {
        const result = await execute(() => createUrl(data));
        if (result) setShortUrl(result.shortUrl);
    };

    const handleClear = () => { reset(); setShortUrl(''); setCopied(false); };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const features = [
        { icon: FaRocket,    title: 'Lightning Fast',       description: 'Create short URLs in seconds with our optimized platform',  color: 'from-blue-500 to-blue-700',    glow: 'shadow-blue-500/20'    },
        { icon: FaShieldAlt, title: 'Secure & Reliable',    description: 'Your links are protected with enterprise-grade security',    color: 'from-violet-500 to-purple-700', glow: 'shadow-purple-500/20'  },
        { icon: FaChartLine, title: 'Analytics & Insights', description: 'Track clicks, analyze traffic, and measure performance',      color: 'from-emerald-500 to-teal-700',  glow: 'shadow-emerald-500/20' },
        { icon: FaQrcode,    title: 'QR Code Generation',   description: 'Generate QR codes for effortless mobile sharing',           color: 'from-rose-500 to-pink-700',    glow: 'shadow-rose-500/20'    },
    ];

    const stats = [
        { number: '10M+',  label: 'URLs Shortened', gradient: 'from-blue-400 to-cyan-300'    },
        { number: '500K+', label: 'Happy Users',    gradient: 'from-violet-400 to-purple-300' },
        { number: '99.9%', label: 'Uptime SLA',     gradient: 'from-emerald-400 to-teal-300'  },
        { number: '24/7',  label: 'Support',        gradient: 'from-rose-400 to-pink-300'     },
    ];

    return (
        <div className="w-full">

            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="relative min-h-screen bg-[#060612] flex flex-col items-center justify-center overflow-hidden">
                {/* Animated orbs */}
                <div className="absolute top-1/4 -left-32 w-[560px] h-[560px] bg-blue-600/20 rounded-full blur-[130px] orb-1 pointer-events-none" />
                <div className="absolute bottom-1/4 -right-32 w-[560px] h-[560px] bg-purple-600/20 rounded-full blur-[130px] orb-2 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-900/20 rounded-full blur-[120px] orb-3 pointer-events-none" />

                {/* Grid overlay */}
                <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 w-full max-w-3xl mx-auto px-5 sm:px-6 text-center py-10">

                    {/* Trust badge */}
                    <div className="animate-fade-up inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 md:mb-8 text-sm text-white/70">
                        <FaBolt className="w-3 h-3 text-amber-400" />
                        Trusted by 500K+ users worldwide
                    </div>

                    {/* Headline */}
                    <h1 className="animate-fade-up-d1 text-4xl sm:text-5xl md:text-[72px] font-black text-white leading-[1.05] tracking-tight mb-5 md:mb-6">
                        Turn long URLs into
                        <span className="block gradient-text-animated mt-1">powerful short links</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="animate-fade-up-d2 text-base md:text-xl text-white/55 max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed">
                        Create memorable links, track performance, and share with confidence.
                        Free forever — no sign-up required.
                    </p>

                    {/* Form */}
                    <div className="animate-fade-up-d3 glass-card p-2.5 mb-6">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <FaGlobe className="w-4 h-4 text-white/35" />
                                    </div>
                                    <input
                                        {...register('originalUrl')}
                                        type="url"
                                        placeholder="Paste your long URL here…"
                                        className="w-full h-full bg-[#11182b] border border-white/12 text-white placeholder-white/30 pl-11 pr-4 py-3.5 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-base"
                                    />
                                </div>
                                <Button type="submit" loading={loading} size="lg" className="flex-shrink-0">
                                    <FaLink className="w-4 h-4" />
                                    <span>{loading ? 'Shortening…' : 'Shorten'}</span>
                                </Button>
                            </div>
                        </form>
                        {errors.originalUrl && (
                            <p className="mt-2 px-3 pb-2 text-red-400 text-sm flex items-center gap-1.5">
                                <span>⚠</span> {errors.originalUrl.message}
                            </p>
                        )}
                    </div>

                    {/* API error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-2xl backdrop-blur-sm flex items-center gap-2 text-sm">
                            ❌ {error.errorMessage}
                        </div>
                    )}

                    {/* Success result */}
                    {shortUrl && (
                        <div className="glass-card p-5 mb-6 text-left">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaCheck className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">Your link is ready!</p>
                                    <p className="text-white/40 text-xs">Copy the short URL below</p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3">
                                <a
                                    href={shortUrl}
                                    className="text-blue-400 hover:text-blue-300 font-medium text-sm break-all flex-1 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {shortUrl}
                                </a>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                                            copied
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                : 'bg-white/10 text-white/60 border-white/10 hover:bg-white/20'
                                        }`}
                                    >
                                        {copied ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
                                        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                    <a
                                        href={shortUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/10 text-white/60 hover:bg-white/20 border border-white/10 rounded-lg transition-all duration-200"
                                    >
                                        <FaExternalLinkAlt className="w-3 h-3" />
                                    </a>
                                    <button
                                        onClick={handleClear}
                                        className="px-3 py-2 bg-white/10 text-white/50 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-medium transition-all duration-200"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            {isAuthenticated && (
                                <div className="mt-3 text-center">
                                    <Link
                                        to={routes.urlMappings}
                                        className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                    >
                                        View in Dashboard <FaArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Trust signals */}
                    <div className="flex flex-wrap justify-center gap-5 text-white/35 text-sm">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            No account needed
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                            Free to use
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                            Links never expire
                        </span>
                    </div>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────── */}
            <section className="py-28 bg-[#0d1324] bg-grid-soft relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_34%)] pointer-events-none" />
                <div className="max-w-6xl mx-auto px-6">
                    <div className="relative z-10 text-center mb-16">
                        <span className="inline-block bg-blue-500/10 text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-blue-400/20">
                            Why Shorty URL
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                            Everything you need,<br className="hidden md:block" /> nothing you don't
                        </h2>
                        <p className="text-lg text-white/50 max-w-xl mx-auto">
                            Powerful tools designed to make link management simple, fast, and insightful.
                        </p>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div key={i} className="gradient-border-card p-6">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg ${feature.glow}`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────────── */}
            <section className="py-28 bg-[#060612] bg-grid-dark relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-blue-700/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            Trusted by millions
                        </h2>
                        <p className="text-white/45 text-lg max-w-lg mx-auto">
                            Join a global community of developers, marketers, and creators
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                                <div className={`text-4xl md:text-5xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                                    {stat.number}
                                </div>
                                <div className="text-white/45 text-sm font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA (non-auth only) ───────────────────────────── */}
            {!isAuthenticated && (
                <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700">
                    <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none" />
                    <div className="absolute -top-48 -right-48 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            Unlock more power
                        </h2>
                        <p className="text-white/65 text-lg mb-10">
                            Sign up free to track analytics, manage all your URLs, and access advanced features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={routes.signUp}>
                                <button className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-xl text-base">
                                    Sign Up Free <FaArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                            <Link to={routes.signIn}>
                                <button className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm text-base">
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default UrlShortenerPage;
