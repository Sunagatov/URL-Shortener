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
    <div>
      <label
        htmlFor={inputProps.id}
        className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
        <input
          {...registration}
          {...inputProps}
          className={`${authInputClassName} pl-10 ${inputProps.type === 'number' ? 'pr-4' : ''}`}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-400">{error.message}</p> : null}
    </div>
  );
}
