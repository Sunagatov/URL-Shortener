import type { ElementType, InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { authInputClassName } from '@/features/auth/ui/authStyles';

interface AuthTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  error?: { message?: string };
  icon: ElementType;
  label: string;
  registration: UseFormRegisterReturn;
}

export function AuthTextField({
  error,
  icon: Icon,
  label,
  registration,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
        <input
          {...registration}
          {...inputProps}
          placeholder=" "
          className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${inputProps.type === 'number' ? 'pr-4' : ''} ${error ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
        />
        <label
          htmlFor={inputProps.id}
          className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300"
        >
          {label}
        </label>
      </div>
      {error ? <p className="mt-1 text-xs text-red-400">{error.message}</p> : null}
    </div>
  );
}
