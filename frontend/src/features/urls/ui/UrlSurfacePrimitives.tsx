import type { PropsWithChildren, ReactEventHandler, ReactNode } from 'react';
import { FaCalendarAlt, FaCheck, FaCopy, FaExternalLinkAlt, FaLink } from 'react-icons/fa';
import { Tooltip } from '@/shared/ui';

export function UrlSurfaceCard({
  children,
  className = '',
  title,
}: PropsWithChildren<{ className?: string; title: string }>) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] ${className}`}
    >
      <div className="border-b border-[color:var(--border)] px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function UrlFieldLabel({ children }: PropsWithChildren) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
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
    <Tooltip content={title}>
      <button
        type="button"
        onClick={onClick}
        className={`rounded-lg p-1.5 transition-all ${className}`}
        aria-label={title}
      >
        {children}
      </button>
    </Tooltip>
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
          ? 'text-[color:var(--text-muted)] hover:bg-[var(--badge-bg)] hover:text-[color:var(--avatar-text)]'
          : 'text-[color:var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-[color:var(--text-secondary)]'
      }
    >
      {copied ? (
        <FaCheck
          className={`h-3 w-3 ${primary ? 'text-[color:var(--avatar-text)]' : 'text-[color:var(--text-secondary)]'}`}
        />
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
    <Tooltip content={title}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        aria-label={label ?? title}
        className={`rounded-lg p-1.5 transition-all ${
          primary
            ? 'text-[color:var(--text-muted)] hover:bg-[var(--badge-bg)] hover:text-[color:var(--avatar-text)]'
            : 'text-[color:var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-[color:var(--text-secondary)]'
        }`}
      >
        <FaExternalLinkAlt className="h-3 w-3" />
      </a>
    </Tooltip>
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
      : 'border-[color:var(--border)] bg-[var(--card-bg)]';
  const iconClassName =
    tone === 'warning'
      ? 'border-amber-500/15 bg-amber-500/15 text-amber-400'
      : 'border-blue-500/15 bg-blue-600/15 text-[color:var(--avatar-text)]';
  const textClassName =
    tone === 'warning' ? 'text-amber-300/80' : 'text-[color:var(--text-secondary)]';

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${containerClassName}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${iconClassName}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="mb-0.5 text-[10px] uppercase tracking-widest text-[color:var(--text-muted)]">
          {label}
        </p>
        <p
          className={`text-xs font-semibold ${textClassName}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
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
  return <FaLink className="h-3.5 w-3.5 text-[color:var(--avatar-text)]" />;
}
