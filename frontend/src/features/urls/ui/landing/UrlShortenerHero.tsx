import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheck, FaCopy, FaExternalLinkAlt, FaGlobe, FaLink, FaShareAlt } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { Button, Tooltip } from '@/shared/ui';
import { heroBadgeIcon, heroHighlights } from './landingContent';

interface UrlShortenerHeroProps {
  children: ReactNode;
  copiedShortUrl: string | null;
  isAuthenticated: boolean;
  onClear: () => void;
  onCopy: () => Promise<void>;
  shortUrl: string;
}

export function UrlShortenerHero({
  children,
  copiedShortUrl,
  isAuthenticated,
  onClear,
  onCopy,
  shortUrl,
}: UrlShortenerHeroProps) {
  const HeroBadgeIcon = heroBadgeIcon;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg-alt)] pb-24 md:pb-10">
      <div className="absolute top-1/4 -left-32 h-[560px] w-[560px] rounded-full bg-blue-600/20 blur-[130px] orb-1 pointer-events-none dark:block hidden" />
      <div className="absolute bottom-1/4 -right-32 h-[560px] w-[560px] rounded-full bg-purple-600/20 blur-[130px] orb-2 pointer-events-none dark:block hidden" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-900/20 blur-[120px] orb-3 pointer-events-none dark:block hidden" />
      <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-10 text-center sm:px-6">
        <div className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-[color:var(--border-strong)] bg-[var(--surface-hover)] px-4 py-1.5 text-sm text-[color:var(--text-secondary)] backdrop-blur-sm md:mb-8">
          <HeroBadgeIcon className="h-3 w-3 text-amber-400" />
          Trusted by 500K+ users worldwide
        </div>

        <h1
          className="mb-5 text-4xl font-bold leading-[1.05] tracking-tight text-[color:var(--text-primary)] animate-fade-up-d1 sm:text-5xl md:mb-6 md:text-[68px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          URL shortener for
          <span className="gradient-text-animated mt-1 block">powerful short links</span>
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[color:var(--text-secondary)] animate-fade-up-d2 md:mb-10 md:text-xl">
          Create memorable links, track performance, and share with confidence. Free forever — no
          sign-up required.
        </p>

        {children}

        {shortUrl ? (
          <div className="mb-6 rounded-[1.25rem] border border-[color:var(--border)] bg-[var(--card-bg)] p-5 text-left backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
                <FaCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">Your link is ready!</p>
                <p className="text-xs text-[color:var(--text-muted)]">Copy the short URL below</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] p-3.5">
              <a
                href={shortUrl}
                className="flex-1 break-all text-sm font-medium text-[color:var(--avatar-text)] transition-colors hover:text-[color:var(--avatar-text)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortUrl}
              </a>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  type="button"
                  onClick={onCopy}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    copiedShortUrl === shortUrl
                      ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                      : 'border-[color:var(--border)] bg-[var(--surface-hover)] text-[color:var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {copiedShortUrl === shortUrl ? (
                    <FaCheck className="h-3 w-3" />
                  ) : (
                    <FaCopy className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">
                    {copiedShortUrl === shortUrl ? 'Copied!' : 'Copy'}
                  </span>
                </button>
                <Tooltip content="Open">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-hover)] p-2 text-[color:var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)]"
                    aria-label="Open short URL"
                  >
                    <FaExternalLinkAlt className="h-3 w-3" />
                  </a>
                </Tooltip>
                {typeof navigator !== 'undefined' &&
                  typeof navigator.share === 'function' &&
                  navigator.canShare?.({ url: shortUrl }) && (
                    <Tooltip content="Share">
                      <button
                        type="button"
                        onClick={() => void navigator.share({ url: shortUrl })}
                        className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-hover)] p-2 text-[color:var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)]"
                        aria-label="Share short URL"
                      >
                        <FaShareAlt className="h-3 w-3" />
                      </button>
                    </Tooltip>
                  )}
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-xs font-medium text-[color:var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)]"
                >
                  Clear
                </button>
              </div>
            </div>
            {isAuthenticated ? (
              <div className="mt-3 text-center">
                <Link
                  to={routes.urlMappings}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--avatar-text)] transition-colors hover:text-[color:var(--avatar-text)]"
                >
                  View in Dashboard <FaArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-5 text-sm text-[color:var(--text-muted)]">
          {heroHighlights.map(highlight => (
            <span key={highlight.label} className="flex items-center gap-2">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${highlight.color}`} />
              {highlight.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

interface UrlShortenerFormProps {
  children?: ReactNode;
  advancedOptions?: ReactNode;
  isLoading?: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function UrlShortenerForm({ children, advancedOptions, isLoading = false, onSubmit }: UrlShortenerFormProps) {
  return (
    <div className="glass-card group relative mb-6 animate-fade-up-d3 overflow-hidden p-2.5">
      <div className="pointer-events-none absolute inset-0 rounded-[20px] border border-[color:var(--border)] transition-all duration-300 group-focus-within:border-blue-400/35 group-focus-within:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.22),inset_0_0_42px_rgba(59,130,246,0.18),0_0_0_1px_rgba(59,130,246,0.12)]" />
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <FaGlobe className="h-4 w-4 text-[color:var(--text-muted)]" />
            </div>
            {children}
          </div>
          <Button type="submit" size="lg" loading={isLoading} className="flex-shrink-0">
            <FaLink className="h-4 w-4" />
            <span>{isLoading ? 'Shortening…' : 'Shorten'}</span>
          </Button>
        </div>
        {advancedOptions}
      </form>
    </div>
  );
}
