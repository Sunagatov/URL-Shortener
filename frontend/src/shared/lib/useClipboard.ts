import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '@/shared/lib/clipboard';

const RESET_DELAY_MS = 2000;

export const useClipboard = () => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopiedValue = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    setCopiedValue(null);
  }, []);

  const copyValue = useCallback(async (value: string): Promise<boolean> => {
    const didCopy = await copyToClipboard(value);

    if (!didCopy) {
      return false;
    }

    clearCopiedValue();
    setCopiedValue(value);
    resetTimerRef.current = setTimeout(() => {
      setCopiedValue(null);
      resetTimerRef.current = null;
    }, RESET_DELAY_MS);

    return true;
  }, [clearCopiedValue]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return {
    copiedValue,
    copyValue,
    clearCopiedValue,
  };
};
