import { useCallback, useEffect, useState } from 'react';
import { requestPasswordReset } from '@/features/auth/api/passwordResetApi';
import {
  getRecoveryNetworkFailureMessage,
  getRecoverySuccessNotice,
  RESEND_COOLDOWN_SECONDS,
  tickCooldown,
  type RecoveryRequestMode,
} from '@/features/auth/lib/forgotPasswordFlow';
import { getApiErrorStatus } from '@/shared/lib/apiErrors';

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
      setCooldownSeconds((seconds) => tickCooldown(seconds));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds, submitted]);

  const completeSubmission = (targetEmail: string, notice = '') => {
    setSubmittedEmail(targetEmail);
    setSubmitted(true);
    setInlineNotice(notice);
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  };

  const sendRecoveryLink = useCallback(async (targetEmail: string, mode: RecoveryRequestMode) => {
    if (mode === 'initial') {
      setError('');
      setIsLoading(true);
    } else {
      setInlineNotice('');
      setIsResending(true);
    }

    try {
      await requestPasswordReset(targetEmail);
      completeSubmission(targetEmail, getRecoverySuccessNotice(mode));
    } catch (err: unknown) {
      if (getApiErrorStatus(err) !== undefined) {
        completeSubmission(targetEmail, getRecoverySuccessNotice(mode));
        return;
      }

      if (mode === 'initial') {
        setError(getRecoveryNetworkFailureMessage(mode));
      } else {
        setInlineNotice(getRecoveryNetworkFailureMessage(mode));
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
