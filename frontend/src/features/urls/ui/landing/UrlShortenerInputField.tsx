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
        className={`h-full w-full rounded-xl border border-white/8 bg-[linear-gradient(180deg,rgba(17,24,43,0.96)_0%,rgba(11,17,32,0.98)_100%)] py-3.5 pl-11 pr-4 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(3,8,20,0.18)] placeholder-white/30 transition-all duration-200 focus:border-blue-400/35 focus:outline-none focus:ring-2 focus:ring-blue-500/35 ${error ? 'animate-error-shake border-red-500/35 focus:ring-red-500/35' : ''}`}
        spellCheck={false}
      />
      {error ? (
        <p className="-mt-4 mb-6 flex items-center gap-1.5 px-3 text-sm text-red-400">
          <span>⚠</span> {error.message}
        </p>
      ) : null}
    </>
  );
}
