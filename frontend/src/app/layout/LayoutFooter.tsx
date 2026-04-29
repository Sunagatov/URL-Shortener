import { Link } from 'react-router-dom';
import { FaHeart, FaLink } from 'react-icons/fa';
import { footerSocialLinks } from '@/app/layout/layoutNavigation';
import { routes } from '@/app/routes';

export const LayoutFooter = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <footer className="bg-grid-dark border-t border-white/10 bg-[#060612] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <FaLink className="h-4 w-4 text-white/70" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                Shorty URL
              </span>
            </div>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-white/50">
              The modern, secure, and reliable URL shortening service. Create short links,
              track analytics, and manage your URLs with ease.
            </p>
            <div className="flex items-center space-x-2 text-sm text-white/30">
              <span>Made with</span>
              <FaHeart className="h-3 w-3 text-red-400" />
              <span>by developers, for developers</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link
                to={routes.home}
                className="block text-sm text-white/50 transition-colors duration-200 hover:text-white/80"
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={routes.dashboard}
                    className="block text-sm text-white/50 transition-colors duration-200 hover:text-white/80"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={routes.urlMappings}
                    className="block text-sm text-white/50 transition-colors duration-200 hover:text-white/80"
                  >
                    My URLs
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={routes.signIn}
                    className="block text-sm text-white/50 transition-colors duration-200 hover:text-white/80"
                  >
                    Sign In
                  </Link>
                  <Link
                    to={routes.signUp}
                    className="block text-sm text-white/50 transition-colors duration-200 hover:text-white/80"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
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
                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition-all duration-200 hover:scale-110 hover:bg-white/15"
                  >
                    <Icon className="h-4 w-4 text-white/60 group-hover:text-white" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
          <p className="mb-4 text-sm text-white/30 md:mb-0">© 2026 Shorty URL. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-sm">
            <span className="cursor-not-allowed text-white/20">Privacy Policy (coming soon)</span>
            <span className="cursor-not-allowed text-white/20">Terms of Service (coming soon)</span>
            <span className="cursor-not-allowed text-white/20">Support (coming soon)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
