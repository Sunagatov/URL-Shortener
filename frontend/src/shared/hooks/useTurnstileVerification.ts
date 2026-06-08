import { useCallback, useRef, useState } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

export function useTurnstileVerification(enabled: boolean) {
  const widgetRef = useRef<TurnstileInstance>(undefined);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleVerify = useCallback((nextToken: string) => {
    setToken(nextToken);
    setError('');
  }, []);

  const clearToken = useCallback(() => {
    setToken('');
  }, []);

  const resetChallenge = useCallback(() => {
    setToken('');
    setError('');
    widgetRef.current?.reset();
  }, []);

  const requireVerified = useCallback(() => {
    if (!enabled || token) {
      return true;
    }

    setError('Complete the security check to continue.');
    return false;
  }, [enabled, token]);

  return {
    clearToken,
    error,
    handleVerify,
    requireVerified,
    resetChallenge,
    token,
    widgetRef,
  };
}
