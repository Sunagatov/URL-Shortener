import type { RefObject } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { turnstileSiteKey } from '@/shared/config/features';

interface TurnstileWidgetProps {
  action: string;
  className?: string;
  onClear: () => void;
  onVerify: (token: string) => void;
  widgetRef: RefObject<TurnstileInstance | undefined>;
}

export function TurnstileWidget({
  action,
  className = '',
  onClear,
  onVerify,
  widgetRef,
}: TurnstileWidgetProps) {
  if (!turnstileSiteKey) {
    return null;
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] ${className}`}>
      <Turnstile
        ref={widgetRef}
        siteKey={turnstileSiteKey}
        onSuccess={onVerify}
        onExpire={onClear}
        onError={onClear}
        onTimeout={onClear}
        onUnsupported={onClear}
        options={{
          action,
          refreshExpired: 'auto',
          refreshTimeout: 'auto',
          size: 'flexible',
          theme: 'auto',
        }}
      />
    </div>
  );
}
