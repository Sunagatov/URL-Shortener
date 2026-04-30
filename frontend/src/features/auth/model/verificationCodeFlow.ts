import { useCallback, useEffect, useRef, useState } from 'react';
import { resendVerificationCode, verifyEmail } from '@/features/auth/api/emailVerificationApi';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import type { AuthTokens } from '@/shared/types';

const VERIFICATION_CODE_LENGTH = 6;

export function useVerificationCodeFlow({
  completeAuth,
  destination,
  email,
}: {
  completeAuth: (tokens: AuthTokens, destination: string) => Promise<void>;
  destination: string;
  email: string;
}) {
  const [digits, setDigits] = useState<string[]>(Array(VERIFICATION_CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(VERIFICATION_CODE_LENGTH).fill(null));

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const focusFirstInput = () => {
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  const verifyCode = useCallback(
    async (code: string) => {
      if (code.length !== VERIFICATION_CODE_LENGTH || isLoading) {
        return false;
      }

      setIsLoading(true);
      setError('');

      try {
        const tokens = await verifyEmail({ email, code });
        await completeAuth(tokens, destination);
        return true;
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Invalid or expired code. Please try again.'));
        setDigits(Array(VERIFICATION_CODE_LENGTH).fill(''));
        focusFirstInput();
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [completeAuth, destination, email, isLoading],
  );

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);
    setError('');

    if (!digit) {
      return;
    }

    if (index < VERIFICATION_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (nextDigits.every(Boolean)) {
      void verifyCode(nextDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        setDigits(nextDigits);
        return;
      }

      if (index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        setDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < VERIFICATION_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, VERIFICATION_CODE_LENGTH);

    if (!pasted) {
      return;
    }

    const nextDigits = Array(VERIFICATION_CODE_LENGTH).fill('');

    for (let index = 0; index < pasted.length; index += 1) {
      nextDigits[index] = pasted[index];
    }

    setDigits(nextDigits);
    setError('');

    const nextEmptyIndex = nextDigits.findIndex((digit) => !digit);
    inputRefs.current[nextEmptyIndex === -1 ? VERIFICATION_CODE_LENGTH - 1 : nextEmptyIndex]?.focus();

    if (pasted.length === VERIFICATION_CODE_LENGTH) {
      void verifyCode(pasted);
    }
  };

  const resendCode = async () => {
    if (countdown > 0 || isResending || !email) {
      return;
    }

    setIsResending(true);
    setError('');

    try {
      await resendVerificationCode(email);
      setCountdown(60);
      setDigits(Array(VERIFICATION_CODE_LENGTH).fill(''));
      focusFirstInput();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend code. Please try again.'));
    } finally {
      setIsResending(false);
    }
  };

  return {
    countdown,
    digits,
    error,
    handleChange,
    handleKeyDown,
    handlePaste,
    inputRefs,
    isLoading,
    isResending,
    resendCode,
    verifyCode,
  };
}
