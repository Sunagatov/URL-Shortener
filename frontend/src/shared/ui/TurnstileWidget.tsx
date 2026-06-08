import type { RefObject } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { turnstileSiteKey } from '@/shared/config/features';
import { useTheme } from '@/shared/theme/ThemeProvider';

type TurnstileSize = 'normal' | 'compact' | 'flexible';
type TurnstileAppearance = 'always' | 'execute' | 'interaction-only';

interface TurnstileWidgetProps {
  action: string;
  appearance?: TurnstileAppearance;
  className?: string;
  onClear: () => void;
  onVerify: (token: string) => void;
  size?: TurnstileSize;
  widgetRef: RefObject<TurnstileInstance | undefined>;
}

export function TurnstileWidget({
  action,
  appearance = 'always',
  className = '',
  onClear,
  onVerify,
  size = 'normal',
  widgetRef,
}: TurnstileWidgetProps) {
  const { theme } = useTheme();

  if (!turnstileSiteKey) {
    return null;
  }

  return (
    <div className={`mx-auto flex max-w-full justify-center overflow-hidden rounded-xl bg-transparent ${className}`}>
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
          appearance,
          refreshExpired: 'auto',
          refreshTimeout: 'auto',
          size,
          theme,
        }}
      />
    </div>
  );
}
