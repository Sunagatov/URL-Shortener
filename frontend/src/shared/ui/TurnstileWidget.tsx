import { useState, type RefObject } from 'react';
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
  const [error, setError] = useState('');
  const [scriptFailed, setScriptFailed] = useState(false);

  const handleFailure = () => {
    onClear();
    setError('Security check failed. Check your connection and try again.');
  };

  if (!turnstileSiteKey) {
    return null;
  }

  return (
    <div
      className={`mx-auto flex max-w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-transparent ${className}`}
    >
      <Turnstile
        ref={widgetRef}
        siteKey={turnstileSiteKey}
        onSuccess={token => {
          setError('');
          onVerify(token);
        }}
        onExpire={onClear}
        onError={handleFailure}
        onTimeout={handleFailure}
        onUnsupported={() => {
          onClear();
          setError('Your browser could not run the security check. Try an updated browser.');
        }}
        scriptOptions={{
          onError: () => {
            onClear();
            setScriptFailed(true);
            setError('Security check could not load. Check your connection or content blocker.');
          },
        }}
        options={{
          action,
          appearance,
          refreshExpired: 'auto',
          refreshTimeout: 'manual',
          retry: 'never',
          size,
          theme,
        }}
      />
      {error ? (
        <div className="mt-2 text-center text-xs text-[color:var(--danger-text)]">
          <p role="alert">{error}</p>
          <button
            type="button"
            className="mt-1 rounded px-2 py-1 font-medium underline"
            onClick={() => {
              if (scriptFailed) {
                window.location.reload();
                return;
              }
              setError('');
              widgetRef.current?.reset();
            }}
          >
            {scriptFailed ? 'Reload page' : 'Retry security check'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
