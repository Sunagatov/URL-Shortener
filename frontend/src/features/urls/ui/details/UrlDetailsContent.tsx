import {
    FaCalendarAlt,
    FaCheck,
    FaClock,
    FaCopy,
    FaExternalLinkAlt,
    FaLink,
    FaLock,
    FaQrcode,
    FaTrash
} from 'react-icons/fa';
import {Button} from '@/shared/ui';
import type {UrlMapping} from '@/shared/types';
import {formatUrlDate, getDomainLabel} from '@/features/urls/lib/urlMappings';

interface UrlDetailsHeaderProps {
    onBack: () => void;
    onDelete: () => void;
    urlMapping: UrlMapping;
}

export function UrlDetailsHeader({onBack, onDelete, urlMapping}: UrlDetailsHeaderProps) {
    return (
        <div className="mb-8 mt-3 md:mt-0">
            <button
                onClick={onBack}
                className="group mb-5 inline-flex items-center gap-1.5 text-sm text-white/35 transition-colors hover:text-white/70"
            >
                <span className="transition-transform group-hover:-translate-x-0.5">←</span>
                Back to My URLs
            </button>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-4">
                    <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/15">
                        <FaLink className="h-5 w-5 text-blue-400"/>
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold tracking-tight text-white"
                            style={{fontFamily: 'var(--font-display)'}}
                        >
                            URL Details
                        </h1>
                        <p className="mt-0.5 text-sm text-white/40">{getDomainLabel(urlMapping.originalUrl)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="group relative inline-flex">
                        <Button variant="secondary" size="sm" disabled className="border-dashed opacity-40">
                            <FaLock className="h-3 w-3"/>
                            <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <div
                            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0d0f1e] px-2.5 py-1.5 text-xs text-white/55 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                            Coming soon
                        </div>
                    </div>
                    <Button onClick={onDelete} variant="danger" size="sm">
                        <FaTrash className="h-3.5 w-3.5"/>
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface UrlInfoCardProps {
    copiedValue: string | null;
    onCopy: (url: string) => Promise<void>;
    urlMapping: UrlMapping;
}

export function UrlInfoCard({copiedValue, onCopy, urlMapping}: UrlInfoCardProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] lg:col-span-3">
            <div className="border-b border-white/[0.06] px-5 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    URL Information
                </p>
            </div>
            <div className="space-y-4 p-5">
                <UrlValueRow
                    label="Short URL"
                    value={urlMapping.shortUrl}
                    href={urlMapping.shortUrl}
                    copiedValue={copiedValue}
                    onCopy={onCopy}
                    tone="primary"
                />
                <UrlValueRow
                    label="Original URL"
                    value={urlMapping.originalUrl}
                    href={urlMapping.originalUrl}
                    copiedValue={copiedValue}
                    onCopy={onCopy}
                    tone="default"
                />
            </div>
        </div>
    );
}

function UrlValueRow({
                         copiedValue,
                         href,
                         label,
                         onCopy,
                         tone,
                         value,
                     }: {
    copiedValue: string | null;
    href: string;
    label: string;
    onCopy: (url: string) => Promise<void>;
    tone: 'default' | 'primary';
    value: string;
}) {
    const containerClassName =
        tone === 'primary'
            ? 'border-blue-500/15 bg-[#0a1220]'
            : 'border-white/[0.06] bg-white/[0.03]';
    const linkClassName =
        tone === 'primary'
            ? 'text-blue-400 hover:text-blue-300'
            : 'text-white/50 hover:text-white/80';
    const buttonClassName =
        tone === 'primary'
            ? 'text-white/30 hover:bg-blue-500/10 hover:text-blue-300'
            : 'text-white/30 hover:bg-white/5 hover:text-white/60';
    const copiedIconClassName = tone === 'primary' ? 'text-blue-400' : 'text-white/60';

    return (
        <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {label}
            </label>
            <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${containerClassName}`}>
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 break-all transition-colors ${linkClassName}`}
                    style={{fontFamily: 'var(--font-mono)', fontSize: '0.82rem'}}
                >
                    {value}
                </a>
                <div className="flex shrink-0 gap-1">
                    <button
                        onClick={() => onCopy(value)}
                        className={`rounded-lg p-2 transition-all ${buttonClassName}`}
                        title="Copy"
                    >
                        {copiedValue === value ? (
                            <FaCheck className={`h-3.5 w-3.5 ${copiedIconClassName}`}/>
                        ) : (
                            <FaCopy className="h-3.5 w-3.5"/>
                        )}
                    </button>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-lg p-2 transition-all ${buttonClassName}`}
                    >
                        <FaExternalLinkAlt className="h-3.5 w-3.5"/>
                    </a>
                </div>
            </div>
        </div>
    );
}

export function UrlMetadataCard({urlMapping}: { urlMapping: UrlMapping }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] lg:col-span-2">
            <div className="border-b border-white/[0.06] px-5 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Details</p>
            </div>
            <div className="space-y-3 p-4">
                <MetadataRow
                    icon={FaCalendarAlt}
                    label="Created"
                    value={formatUrlDate(urlMapping.createdAt, true)}
                    tone="default"
                />
                {urlMapping.expirationDate ? (
                    <MetadataRow
                        icon={FaClock}
                        label="Expires"
                        value={formatUrlDate(urlMapping.expirationDate, true)}
                        tone="warning"
                    />
                ) : null}
                <div
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 opacity-40">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <FaQrcode className="h-3.5 w-3.5 text-white/40"/>
                    </div>
                    <div>
                        <p className="mb-0.5 text-[10px] uppercase tracking-widest text-white/30">QR Code</p>
                        <p className="text-xs text-white/40">Coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetadataRow({
                         icon: Icon,
                         label,
                         tone,
                         value,
                     }: {
    icon: typeof FaCalendarAlt;
    label: string;
    tone: 'default' | 'warning';
    value: string;
}) {
    const containerClassName =
        tone === 'warning'
            ? 'border-amber-500/15 bg-amber-900/15'
            : 'border-white/[0.06] bg-white/[0.03]';
    const iconClassName =
        tone === 'warning'
            ? 'border-amber-500/15 bg-amber-500/15 text-amber-400'
            : 'border-blue-500/15 bg-blue-600/15 text-blue-400';
    const textClassName = tone === 'warning' ? 'text-amber-300/80' : 'text-white/80';

    return (
        <div className={`flex items-center gap-3 rounded-xl border p-3 ${containerClassName}`}>
            <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${iconClassName}`}>
                <Icon className="h-3.5 w-3.5"/>
            </div>
            <div>
                <p className="mb-0.5 text-[10px] uppercase tracking-widest text-white/30">{label}</p>
                <p
                    className={`text-xs font-semibold ${textClassName}`}
                    style={{fontFamily: 'var(--font-mono)'}}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}
