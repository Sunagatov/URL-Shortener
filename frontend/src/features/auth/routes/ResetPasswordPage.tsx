import React from 'react';
import { FaKey, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useResetPasswordFlow } from '@/features/auth/model/useResetPasswordFlow';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { ResetPasswordForm } from '@/features/auth/ui/reset-password/ResetPasswordForm';
import {
  ResetPasswordMissingTokenState,
  ResetPasswordSuccessState,
} from '@/features/auth/ui/reset-password/ResetPasswordStates';
import { usePageTitle } from '@/shared/lib/usePageTitle';

const resetPasswordBrandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-12 py-16 lg:flex lg:w-[480px] xl:w-[520px]"
    heading={
      <>
        Choose a strong
        <br />
        <span className="gradient-text-animated">new password.</span>
      </>
    }
    description="Pick something you'll remember but others won't guess. We'll keep it safe."
    features={[
      { icon: FaLock, text: '15+ characters supported' },
      { icon: FaShieldAlt, text: 'Passphrases and password managers welcome' },
      { icon: FaKey, text: 'Only the latest recovery link stays active' },
    ]}
    stats={[
      { value: '64 char', label: 'Password support' },
      { value: '1 link', label: 'Active recovery link' },
      { value: 'Private', label: 'Recovery flow' },
    ]}
  />
);

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
