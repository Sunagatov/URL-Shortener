import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type UrlShortenerInputFieldProps = {
  error?: FieldError;
  registration: UseFormRegisterReturn<'originalUrl'>;
};

export function UrlShortenerInputField({
  error,
  registration,
}: UrlShortenerInputFieldProps) {
  return (
    <>
      <input
        {...registration}
        type="url"
        autoFocus
        placeholder="Paste your long URL here…"
        className={`h-full w-full rounded-xl border border-[color:var(--border)] bg-[var(--input-bg)] py-3.5 pl-11 pr-4 text-base text-[color:var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(3,8,20,0.18)] placeholder-[color:var(--text-muted)] transition-all duration-200 focus:border-blue-400/35 focus:outline-none focus:ring-2 focus:ring-blue-500/35 ${error ? 'animate-error-shake border-red-500/35 focus:ring-red-500/35' : ''}`}
        spellCheck={false}
      />
      {error ? (
        <p className="-mt-4 mb-6 flex items-center gap-1.5 px-3 text-sm text-[color:var(--danger-text)]">
          <span>⚠</span> {error.message}
        </p>
      ) : null}
    </>
  );
}
