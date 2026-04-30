import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

const baseClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition ' +
  'duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] ' +
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55';

const variantClassName = {
  primary:
    'border border-[color:var(--accent-border)] bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-strong)_100%)] ' +
    'text-white shadow-[0_14px_30px_rgba(6,182,212,0.18)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(6,182,212,0.24)]',
  secondary:
    'border border-[color:var(--border-strong)] bg-[color:var(--surface-raised)] text-[color:var(--text-primary)] ' +
    'hover:border-[color:var(--accent-border)] hover:bg-white/10',
  danger:
    'border border-red-500/30 bg-[linear-gradient(135deg,rgba(239,68,68,0.95)_0%,rgba(220,38,38,0.95)_100%)] ' +
    'text-white shadow-[0_14px_28px_rgba(239,68,68,0.18)] hover:-translate-y-0.5',
  ghost:
    'border border-transparent bg-transparent text-[color:var(--text-secondary)] hover:border-[color:var(--border-strong)] hover:bg-white/6 hover:text-white',
} as const;

const sizeClassName = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-13 px-6 text-base',
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    className = '',
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${baseClassName} ${variantClassName[variant]} ${sizeClassName[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 shrink-0 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4l3-3-3-3V0a12 12 0 1 0 0 24v-4l-3 3 3 3v4A12 12 0 0 1 4 12Z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
});
