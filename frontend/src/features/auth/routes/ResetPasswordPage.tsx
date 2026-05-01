import React from 'react';
import { useResetPasswordFlow } from '@/features/auth/model/useResetPasswordFlow';
import { resetPasswordBrandPanel } from '@/features/auth/ui/AuthRoutePanels';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { ResetPasswordForm } from '@/features/auth/ui/reset-password/ResetPasswordForm';
import {
  ResetPasswordMissingTokenState,
  ResetPasswordSuccessState,
} from '@/features/auth/ui/reset-password/ResetPasswordStates';
import { usePageTitle } from '@/shared/lib/usePageTitle';

const ResetPasswordPage: React.FC = () => {
  usePageTitle('Reset Password');
  const {
    confirmPassword,
    error,
    isLoading,
    isSubmitDisabled,
    newPassword,
    passwordStrength,
    passwordsMatch,
    setConfirmPassword,
    setNewPassword,
    showConfirm,
    showNew,
    submit,
    success,
    toggleConfirmVisibility,
    toggleNewVisibility,
    token,
  } = useResetPasswordFlow();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submit();
  };

  if (!token) {
    return (
      <AuthPageShell
        title="Recovery link unavailable"
        description="This page needs a valid recovery token before you can choose a new password."
        brandPanel={resetPasswordBrandPanel}
      >
        <ResetPasswordMissingTokenState />
      </AuthPageShell>
    );
  }

  if (success) {
    return (
      <AuthPageShell
        title="Password updated"
        description="Your new password is ready to use the next time you sign in."
        brandPanel={resetPasswordBrandPanel}
      >
        <ResetPasswordSuccessState />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Create a new password"
      description="Use a long password or passphrase. Password managers work especially well here."
      brandPanel={resetPasswordBrandPanel}
    >
      <ResetPasswordForm
        confirmPassword={confirmPassword}
        error={error}
        isLoading={isLoading}
        isSubmitDisabled={isSubmitDisabled}
        newPassword={newPassword}
        passwordStrength={passwordStrength}
        passwordsMatch={passwordsMatch}
        showConfirm={showConfirm}
        showNew={showNew}
        onConfirmPasswordChange={setConfirmPassword}
        onNewPasswordChange={setNewPassword}
        onSubmit={handleSubmit}
        onToggleConfirmVisibility={toggleConfirmVisibility}
        onToggleNewVisibility={toggleNewVisibility}
      />
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
