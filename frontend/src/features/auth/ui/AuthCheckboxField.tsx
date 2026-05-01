import type { InputHTMLAttributes, ReactNode } from 'react';
import { FaCheck } from 'react-icons/fa';

interface AuthCheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  description?: ReactNode;
  error?: string;
  label: ReactNode;
}

export function AuthCheckboxField({
  description,
  error,
  id,
  label,
  ...inputProps
}: AuthCheckboxFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            {...inputProps}
            id={id}
            type="checkbox"
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[color:var(--border-strong)] bg-[color:var(--surface-raised)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-ring)] peer-checked:border-[color:var(--accent-border)] peer-checked:bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-strong)_100%)] peer-checked:shadow-[0_10px_22px_rgba(6,182,212,0.2)]">
            <FaCheck className="h-2.5 w-2.5 scale-0 text-white transition-transform duration-150 peer-checked:scale-100" />
          </span>
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium leading-snug text-[color:var(--text-secondary)]">
            {label}
          </span>
          {description ? (
            <span className="mt-1 block text-xs leading-relaxed text-[color:var(--text-muted)]">
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
