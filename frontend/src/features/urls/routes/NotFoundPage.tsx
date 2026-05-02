import { Link } from 'react-router-dom';
import { FaHome, FaLink } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { usePageTitle } from '@/shared/lib/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page Not Found');

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[color:var(--border)] bg-[var(--surface-hover)]">
          <FaLink className="h-8 w-8 text-[color:var(--text-muted)]" />
        </div>
        <h1 className="mb-2 text-6xl font-bold text-[color:var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
          404
        </h1>
        <p className="mb-1 text-lg font-semibold text-[color:var(--text-primary)]">Page not found</p>
        <p className="mb-8 text-sm text-[color:var(--text-muted)]">
          The link you followed may be broken, expired, or doesn't exist.
        </p>
        <Link
          to={routes.home}
          className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--accent-border)] bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-strong)_100%)] px-6 py-3 text-sm font-semibold text-[color:var(--text-on-accent)] transition hover:-translate-y-0.5"
        >
          <FaHome className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
