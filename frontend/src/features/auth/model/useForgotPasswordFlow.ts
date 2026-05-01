import { useCallback, useEffect, useState } from 'react';
import { requestPasswordReset } from '@/features/auth/api/passwordResetApi';
import { getApiErrorStatus } from '@/shared/lib/apiErrors';

const RESEND_COOLDOWN_SECONDS = 30;

export function useForgotPasswordFlow() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [error, setError] = useState('');
  const [inlineNotice, setInlineNotice] = useState('');

  useEffect(() => {
    if (!submitted || cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds, submitted]);

  const completeSubmission = (targetEmail: string, notice = '') => {
    setSubmittedEmail(targetEmail);
    setSubmitted(true);
    setInlineNotice(notice);
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  };

  const sendRecoveryLink = useCallback(async (targetEmail: string, mode: 'initial' | 'resend') => {
    if (mode === 'initial') {
      setError('');
      setIsLoading(true);
    } else {
      setInlineNotice('');
      setIsResending(true);
    }

    try {
      await requestPasswordReset(targetEmail);
      completeSubmission(
        targetEmail,
        mode === 'resend' ? 'If that account exists, we sent a fresh recovery email.' : '',
      );
    } catch (err: unknown) {
      if (getApiErrorStatus(err) !== undefined) {
        completeSubmission(
          targetEmail,
          mode === 'resend' ? 'If that account exists, we sent a fresh recovery email.' : '',
        );
        return;
      }

      if (mode === 'initial') {
        setError('We could not reach the server. Please check your connection and try again.');
      } else {
        setInlineNotice('We could not send another email right now. Please try again shortly.');
      }
    } finally {
      if (mode === 'initial') {
        setIsLoading(false);
      } else {
        setIsResending(false);
      }
    }
  }, []);

  return {
    cooldownSeconds,
    email,
    error,
    inlineNotice,
    isLoading,
    isResending,
    resend: async (targetEmail: string) => sendRecoveryLink(targetEmail, 'resend'),
    reset: (targetEmail: string) => {
      setSubmitted(false);
      setEmail(targetEmail);
      setInlineNotice('');
    },
    setEmail,
    submit: async () => sendRecoveryLink(email.trim(), 'initial'),
    submitted,
    submittedEmail,
  };
}
