import { Link } from 'react-router-dom';
import { FaLink } from 'react-icons/fa';
import { footerSocialLinks } from '@/app/config/footerSocialLinks';
import { routes } from '@/app/routes';

const linkClass =
  'block text-sm text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-primary)]';

export const LayoutFooter = ({ isAuthenticated }: { isAuthenticated: boolean }) => (
  <footer className="border-t border-[color:var(--border)] bg-[var(--surface)]">
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Top: brand + nav + social */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        {/* Brand */}
        <div className="max-w-xs">
          <Link to={routes.home} className="mb-3 inline-flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[color:var(--accent-border)] bg-[var(--accent-glow)]">
              <FaLink className="h-3.5 w-3.5 text-[color:var(--accent)]" />
            </div>
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--text-primary)] bg-clip-text text-lg font-bold text-transparent">
              Shorty URL
            </span>
          </Link>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
            Fast, secure link shortening with built-in analytics.
          </p>
        </div>

        {/* Nav columns */}
        <div className="flex gap-12 text-sm">
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">Product</h4>
            <Link to={routes.home} className={linkClass}>Home</Link>
            {isAuthenticated ? (
              <>
                <Link to={routes.dashboard} className={linkClass}>Dashboard</Link>
                <Link to={routes.urlMappings} className={linkClass}>My URLs</Link>
                <Link to={routes.analytics} className={linkClass}>Analytics</Link>
              </>
            ) : (
              <>
                <Link to={routes.signIn} className={linkClass}>Sign In</Link>
                <Link to={routes.signUp} className={linkClass}>Sign Up</Link>
              </>
            )}
          </div>
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">Legal</h4>
            <span className={linkClass}>Privacy Policy</span>
            <span className={linkClass}>Terms of Service</span>
          </div>
        </div>

        {/* Social */}
        <div className="flex gap-2">
          {footerSocialLinks.map(link => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[var(--surface-hover)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-border)]"
              >
                <Icon className="h-4 w-4 text-[color:var(--text-muted)]" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[color:var(--border)] pt-6 text-xs text-[color:var(--text-muted)] sm:flex-row">
        <span>© {new Date().getFullYear()} Shorty URL</span>
        <span>Made by developers, for developers</span>
      </div>
    </div>
  </footer>
);
