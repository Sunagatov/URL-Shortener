import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/shared/lib/logger';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('frontend.runtime.react_render_error', {
      componentStack: errorInfo.componentStack,
      error,
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[color:var(--page-bg)] px-6">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/35">
              Application Error
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              The app hit an unexpected problem.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
              The failure was logged. Reload the page to retry the current flow.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              >
                Reload page
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
