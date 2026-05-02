import { Tooltip } from '@/shared/ui';
import {
  UrlCopyButton,
  UrlExternalLinkButton,
  UrlFieldLabel,
} from '@/features/urls/ui/UrlSurfacePrimitives';

type UrlValueFieldProps = {
  copyValue?: string;
  copiedValue: string | null;
  displayValue?: string;
  href?: string;
  label: string;
  onCopy: (url: string) => void | Promise<void>;
  tone?: 'default' | 'primary';
  value: string;
  valueClassName?: string;
  valueLabel?: string;
};

export function UrlValueField({
  copyValue,
  copiedValue,
  displayValue,
  href,
  label,
  onCopy,
  tone = 'default',
  value,
  valueClassName,
  valueLabel,
}: UrlValueFieldProps) {
  const effectiveCopyValue = copyValue ?? value;
  const renderedValue = displayValue ?? value;
  const containerClassName =
    tone === 'primary'
      ? 'border-blue-500/15 bg-[#0a1220] hover:border-blue-500/20'
      : 'border-[color:var(--border)] bg-[var(--card-bg)] hover:border-[color:var(--border)]';
  const textClassName =
    tone === 'primary' ? 'text-[color:var(--avatar-text)]' : 'text-[color:var(--text-muted)]';

  return (
    <div>
      <UrlFieldLabel>{label}</UrlFieldLabel>
      <div
        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${containerClassName}`}
      >
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 truncate transition-colors ${textClassName} ${valueClassName ?? ''}`}
            style={{ fontFamily: 'var(--font-mono)' }}
            aria-label={valueLabel ?? value}
          >
            {renderedValue}
          </a>
        ) : (
          <span
            className={`flex-1 truncate ${textClassName} ${valueClassName ?? ''}`}
            style={{ fontFamily: 'var(--font-mono)' }}
            aria-label={valueLabel ?? value}
          >
            {renderedValue}
          </span>
        )}
        <div className="flex shrink-0 items-center gap-1">
          <UrlCopyButton
            copied={copiedValue === effectiveCopyValue}
            onCopy={() => {
              void onCopy(effectiveCopyValue);
            }}
            primary={tone === 'primary'}
            title="Copy"
          />
          {href ? (
            <UrlExternalLinkButton
              href={href}
              primary={tone === 'primary'}
              title="Open"
            />
          ) : null}
        </div>
        {copiedValue === effectiveCopyValue ? (
          <Tooltip content={`${effectiveCopyValue} copied!`}>
            <span className="max-w-[8.5rem] shrink truncate text-[10px] font-medium text-[color:var(--avatar-text)] sm:max-w-[12rem]">
              {effectiveCopyValue} copied!
            </span>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}
