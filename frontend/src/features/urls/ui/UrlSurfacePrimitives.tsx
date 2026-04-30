import type { PropsWithChildren, ReactEventHandler, ReactNode } from 'react';
import {
  FaCalendarAlt,
  FaCheck,
  FaCopy,
  FaExternalLinkAlt,
  FaLink,
} from 'react-icons/fa';

export function UrlSurfaceCard({
  children,
  className = '',
  title,
}: PropsWithChildren<{ className?: string; title: string }>) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] ${className}`}>
      <div className="border-b border-white/[0.06] px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function UrlFieldLabel({ children }: PropsWithChildren) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
      {children}
    </p>
  );
}

export function UrlActionIconButton({
  children,
  className,
  onClick,
  title,
}: {
  children: ReactNode;
  className: string;
  onClick?: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-1.5 transition-all ${className}`}
      title={title}
    >
      {children}
    </button>
  );
}

export function UrlCopyButton({
  copied,
  onCopy,
  primary = false,
  title = 'Copy',
}: {
  copied: boolean;
  onCopy: () => void;
  primary?: boolean;
  title?: string;
}) {
  return (
    <UrlActionIconButton
      onClick={onCopy}
      title={title}
      className={
        primary
          ? 'text-white/30 hover:bg-blue-500/10 hover:text-blue-300'
          : 'text-white/30 hover:bg-white/5 hover:text-white/60'
      }
    >
      {copied ? (
        <FaCheck className={`h-3 w-3 ${primary ? 'text-blue-400' : 'text-white/60'}`} />
      ) : (
        <FaCopy className="h-3 w-3" />
      )}
    </UrlActionIconButton>
  );
}

export function UrlExternalLinkButton({
  href,
  label,
  primary = false,
  onClick,
  title = 'Open',
}: {
  href: string;
  label?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  primary?: boolean;
  title?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      title={title}
      aria-label={label}
      className={`rounded-lg p-1.5 transition-all ${
        primary
          ? 'text-white/30 hover:bg-blue-500/10 hover:text-blue-300'
          : 'text-white/30 hover:bg-white/5 hover:text-white/60'
      }`}
    >
      <FaExternalLinkAlt className="h-3 w-3" />
    </a>
  );
}

export function UrlMetadataRow({
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
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${iconClassName}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="mb-0.5 text-[10px] uppercase tracking-widest text-white/30">{label}</p>
        <p className={`text-xs font-semibold ${textClassName}`} style={{ fontFamily: 'var(--font-mono)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function UrlFavicon({
  domain,
  onError,
}: {
  domain: string;
  onError?: ReactEventHandler<HTMLImageElement>;
}) {
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      width={16}
      height={16}
      onError={onError}
      className="h-4 w-4 object-contain"
    />
  );
}

export function UrlFallbackIcon() {
  return <FaLink className="h-3.5 w-3.5 text-blue-400" />;
}
