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
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/20">
              <FaLink className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span
              className="text-base font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Shorty URL
            </span>
          </div>

          <div className="mb-8">
            <h1
              className="mb-1.5 text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h1>
            <p className="text-sm text-white/40">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
