import { Link } from 'react-router-dom';
import { FaHeart, FaLink } from 'react-icons/fa';
import { footerSocialLinks } from '@/app/config/footerSocialLinks';
import { routes } from '@/app/routes';

export const LayoutFooter = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <footer className="bg-grid-dark border-t border-[color:var(--border)] bg-[rgba(var(--bg-base-rgb),0.68)] text-[color:var(--text-primary)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--accent-border)] bg-[var(--accent-glow)]">
                <FaLink className="h-4 w-4 text-[color:var(--accent)]" />
              </div>
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--text-primary)] bg-clip-text text-xl font-bold text-transparent">
                Shorty URL
              </span>
            </div>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-[color:var(--text-secondary)]">
              The modern, secure, and reliable URL shortening service. Create short links,
              track analytics, and manage your URLs with ease.
            </p>
            <div className="flex items-center space-x-2 text-sm text-[color:var(--text-muted)]">
              <span>Made with</span>
              <FaHeart className="h-3 w-3 text-red-400" />
              <span>by developers, for developers</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[color:var(--text-primary)]">
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link
                to={routes.home}
                className="block text-sm text-[color:var(--text-secondary)] transition-colors duration-200 hover:text-[color:var(--text-primary)]"
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={routes.dashboard}
                    className="block text-sm text-[color:var(--text-secondary)] transition-colors duration-200 hover:text-[color:var(--text-primary)]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={routes.urlMappings}
                    className="block text-sm text-[color:var(--text-secondary)] transition-colors duration-200 hover:text-[color:var(--text-primary)]"
                  >
                    My URLs
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={routes.signIn}
                    className="block text-sm text-[color:var(--text-secondary)] transition-colors duration-200 hover:text-[color:var(--text-primary)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to={routes.signUp}
                    className="block text-sm text-[color:var(--text-secondary)] transition-colors duration-200 hover:text-[color:var(--text-primary)]"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[color:var(--text-primary)]">
              Connect
            </h3>
            <div className="flex space-x-3">
              {footerSocialLinks.map((link) => {
                const Icon = link.icon;
                return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface-hover)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent-border)] hover:bg-[var(--surface-hover)]"
                >
                  <Icon className="h-4 w-4 text-[color:var(--text-secondary)] group-hover:text-[color:var(--text-primary)]" />
                </a>
              );
            })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-[color:var(--border)] pt-8 md:flex-row">
          <p className="mb-4 text-sm text-[color:var(--text-muted)] md:mb-0">
            © 2026 Shorty URL. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <span className="cursor-not-allowed text-[color:var(--text-muted)]">Privacy Policy (coming soon)</span>
            <span className="cursor-not-allowed text-[color:var(--text-muted)]">Terms of Service (coming soon)</span>
            <span className="cursor-not-allowed text-[color:var(--text-muted)]">Support (coming soon)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
