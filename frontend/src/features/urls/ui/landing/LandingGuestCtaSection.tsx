import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { routes } from '@/app/routes';

export function LandingGuestCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#060612] py-28 bg-grid-dark">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/12 blur-[130px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <span className="mb-6 inline-block rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-300/80">
          Get started free
        </span>
        <h2
          className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Unlock more power
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-lg text-white/45">
          Sign up free to track analytics, manage all your URLs, and access advanced features.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={routes.signUp}>
            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]">
              Sign Up Free <FaArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link to={routes.signIn}>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-8 py-3.5 text-base font-semibold text-white/80 transition-all duration-200 hover:bg-white/[0.10] hover:text-white">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
