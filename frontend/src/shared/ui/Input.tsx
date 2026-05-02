import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((
  { label, error, icon, className = '', id, ...props },
  ref
) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const baseStyles =
    'w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-raised)] px-4 py-3 text-[color:var(--text-primary)] ' +
    'placeholder-[color:var(--text-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 ' +
    'focus:border-[color:var(--accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]';
  const errorStyles = error ? 'border-red-500/40 focus:ring-red-500/40' : '';
  const iconStyles = icon ? 'pl-12' : '';

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[color:var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[color:var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`${baseStyles} ${errorStyles} ${iconStyles} ${error ? 'animate-error-shake' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="flex items-center text-sm text-[color:var(--danger)]">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
