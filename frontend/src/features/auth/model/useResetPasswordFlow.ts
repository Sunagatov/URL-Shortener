import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/features/auth/api/passwordResetApi';
import {
  getResetPasswordSubmitDisabled,
  getResetPasswordValidationError,
  passwordsMatch,
} from '@/features/auth/lib/resetPasswordFlow';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { getPasswordStrength } from '@/shared/lib/passwordStrength';

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
  const arePasswordsMatching = passwordsMatch(newPassword, confirmPassword);
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
    const validationError = getResetPasswordValidationError({
      confirmPassword,
      isWeakPassword,
      newPassword,
    });

    if (validationError) {
      setError(validationError);
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
    isSubmitDisabled: getResetPasswordSubmitDisabled({
      confirmPassword,
      isWeakPassword,
      newPassword,
    }),
    newPassword,
    passwordStrength,
    passwordsMatch: arePasswordsMatching,
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
