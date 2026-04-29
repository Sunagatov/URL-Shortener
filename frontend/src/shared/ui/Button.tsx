import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ' +
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary:
      'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white ' +
      'shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] ' +
      'hover:shadow-[0_4px_12px_rgba(59,130,246,0.35)]',
    secondary:
      'bg-white/6 hover:bg-white/10 active:bg-white/5 text-white/75 hover:text-white ' +
      'border border-white/10 hover:border-white/18 ' +
      'backdrop-blur-sm',
    danger:
      'bg-red-600/90 hover:bg-red-600 active:bg-red-700 text-white ' +
      'shadow-[0_1px_2px_rgba(0,0,0,0.4)]',
    ghost:
      'bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 ' +
      'backdrop-blur-sm',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 110 24v-4l-3 3 3 3v4a12 12 0 01-12-12z" />
        </svg>
      )}
      {children}
    </button>
  );
};
