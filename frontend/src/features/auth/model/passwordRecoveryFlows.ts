import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '@/features/auth/api/passwordResetApi';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/apiErrors';
import { getPasswordStrength } from '@/shared/lib/passwordStrength';

const RESEND_COOLDOWN_SECONDS = 30;

export function maskEmailAddress(email: string): string {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email;
  }

  const visibleLocal = localPart.slice(0, 2);
  const hiddenLocal = '•'.repeat(Math.max(localPart.length - visibleLocal.length, 1));
  const [domainName, ...domainTail] = domain.split('.');
  const visibleDomain = domainName.slice(0, 1);
  const hiddenDomain = '•'.repeat(Math.max(domainName.length - visibleDomain.length, 1));

  return `${visibleLocal}${hiddenLocal}@${visibleDomain}${hiddenDomain}${domainTail.length ? `.${domainTail.join('.')}` : ''}`;
}

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

  const sendRecoveryLink = useCallback(
    async (targetEmail: string, mode: 'initial' | 'resend') => {
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
    },
    [],
  );

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

export function useResetPasswordFlow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;
  const isWeakPassword = passwordStrength.strength === 'Weak';

  useEffect(() => {
    if (!searchParams.get('token')) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('token');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const submit = async () => {
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (isWeakPassword) {
      setError('Use at least 15 characters. A passphrase or password manager works well.');
      return false;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
      return true;
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to reset password. The link may have expired.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    confirmPassword,
    error,
    isLoading,
    isSubmitDisabled: isWeakPassword || (confirmPassword.length > 0 && !passwordsMatch),
    newPassword,
    passwordStrength,
    passwordsMatch,
    setConfirmPassword,
    setNewPassword,
    showConfirm,
    showNew,
    submit,
    success,
    toggleConfirmVisibility: () => setShowConfirm((value) => !value),
    toggleNewVisibility: () => setShowNew((value) => !value),
    token,
  };
}
