import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { changePassword } from '@/features/account/api/accountApi';
import { useAuth } from '@/shared/auth/useAuth';
import { getApiErrorMessage, isSessionInvalidError } from '@/shared/lib/apiErrors';
import { useToast } from '@/shared/ui';
import { getPasswordStrength } from '@/shared/lib/passwordStrength';

export function useChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();

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
      toast.error('Use at least 15 characters. A passphrase or password manager works well.');
      setIsLoading(false);
      return false;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully.');
      resetForm();
      return true;
    } catch (error: unknown) {
      if (isSessionInvalidError(error)) {
        logout();
        navigate(routes.signIn, { replace: true });
        return false;
      }

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
