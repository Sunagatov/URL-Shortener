import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { routes } from '@/app/routes';

export function LandingGuestCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-alt)] py-16 bg-grid-dark md:py-28">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <span className="mb-6 inline-block rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-[color:var(--avatar-text)]">
          Get started free
        </span>
        <h2
          className="mb-4 text-4xl font-bold tracking-tight text-[color:var(--text-primary)] md:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Unlock more power
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-lg text-[color:var(--text-muted)]">
          Sign up free to track analytics, manage all your URLs, and access advanced features.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={routes.signUp}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-[color:var(--text-on-accent)] transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]"
          >
            Sign Up Free <FaArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={routes.signIn}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--border)] bg-[var(--surface-hover)] px-8 py-3.5 text-base font-semibold text-[color:var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[color:var(--text-primary)]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
