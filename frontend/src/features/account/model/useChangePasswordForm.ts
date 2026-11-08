import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/useAuth';
import { changePassword } from '@/features/account/api/accountApi';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useToast } from '@/shared/ui';
import { getPasswordStrength } from '@/shared/lib/passwordStrength';
import { getNewPasswordError } from '@/shared/lib/passwordPolicy';

export function useChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { clearSession } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const submit = async () => {
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return false;
    }

    if (passwordStrength.strength === 'Weak') {
      toast.error(getNewPasswordError(newPassword) ?? 'Choose a unique passphrase.');
      setIsLoading(false);
      return false;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed. Please sign in again.');
      resetForm();
      clearSession();
      navigate('/signin', { replace: true });
      return true;
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Error changing password.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    confirmPassword,
    currentPassword,
    isLoading,
    newPassword,
    passwordStrength,
    passwordsMatch,
    setConfirmPassword,
    setCurrentPassword,
    setNewPassword,
    showConfirmPassword,
    showCurrentPassword,
    showNewPassword,
    submit,
    toggleConfirmPassword: () => setShowConfirmPassword(value => !value),
    toggleCurrentPassword: () => setShowCurrentPassword(value => !value),
    toggleNewPassword: () => setShowNewPassword(value => !value),
  };
}
