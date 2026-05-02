import type { ReactNode } from 'react';
import { FaLink } from 'react-icons/fa';

interface AuthPageShellProps {
  brandPanel: ReactNode;
  children: ReactNode;
  description: string;
  title: string;
  width?: 'md' | 'lg';
}

const contentWidthClass = {
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function AuthPageShell({
  brandPanel,
  children,
  description,
  title,
  width = 'md',
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-96px)]">
      {brandPanel}

      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className={`w-full ${contentWidthClass[width]}`}>
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[color:var(--accent-border)] bg-[var(--accent-glow)]">
              <FaLink className="h-3.5 w-3.5 text-[color:var(--accent)]" />
            </div>
            <span
              className="text-base font-bold text-[color:var(--text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Shorty URL
            </span>
          </div>

          <div className="mb-8">
            <h1
              className="mb-1.5 text-3xl font-bold text-[color:var(--text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
