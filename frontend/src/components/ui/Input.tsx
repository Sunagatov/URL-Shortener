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
  const baseStyles = 'w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200';
  const errorStyles = error ? 'border-red-500/40 focus:ring-red-500/40' : '';
  const iconStyles = icon ? 'pl-12' : '';

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-white/70">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`${baseStyles} ${errorStyles} ${iconStyles} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-red-500 text-sm flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
