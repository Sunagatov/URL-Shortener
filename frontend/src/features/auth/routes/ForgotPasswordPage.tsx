import React from 'react';
import { maskEmailAddress } from '@/features/auth/lib/maskEmailAddress';
import { useForgotPasswordFlow } from '@/features/auth/model/useForgotPasswordFlow';
import { forgotPasswordBrandPanel } from '@/features/auth/ui/AuthRoutePanels';
import { ForgotPasswordForm } from '@/features/auth/ui/forgot-password/ForgotPasswordForm';
import { ForgotPasswordSubmittedState } from '@/features/auth/ui/forgot-password/ForgotPasswordSubmittedState';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { usePageTitle } from '@/shared/lib/usePageTitle';

const ForgotPasswordPage: React.FC = () => {
  usePageTitle('Forgot Password');
  const {
    cooldownSeconds,
    email,
    error,
    inlineNotice,
    isLoading,
    isResending,
    resend,
    reset,
    setEmail,
    submit,
    submitted,
    submittedEmail,
  } = useForgotPasswordFlow();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submit();
  };

  if (submitted) {
    return (
      <AuthPageShell
        title="Check your email"
        description={`If an account exists for ${maskEmailAddress(submittedEmail)}, recovery instructions are on the way.`}
        brandPanel={forgotPasswordBrandPanel}
      >
        <ForgotPasswordSubmittedState
          cooldownSeconds={cooldownSeconds}
          inlineNotice={inlineNotice}
          isResending={isResending}
          submittedEmail={submittedEmail}
          onResend={resend}
          onReset={reset}
        />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Recover your account"
      description="Enter your email and, if an account exists, we'll send recovery instructions."
      brandPanel={forgotPasswordBrandPanel}
    >
      <ForgotPasswordForm
        email={email}
        error={error}
        isLoading={isLoading}
        onEmailChange={setEmail}
        onSubmit={handleSubmit}
      />
    </AuthPageShell>
  );
};

export default ForgotPasswordPage;
