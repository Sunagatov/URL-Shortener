import React from 'react';
import { FaClock, FaLock, FaShieldAlt } from 'react-icons/fa';
import { maskEmailAddress } from '@/features/auth/lib/maskEmailAddress';
import { useForgotPasswordFlow } from '@/features/auth/model/useForgotPasswordFlow';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { ForgotPasswordForm } from '@/features/auth/ui/forgot-password/ForgotPasswordForm';
import { ForgotPasswordSubmittedState } from '@/features/auth/ui/forgot-password/ForgotPasswordSubmittedState';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { usePageTitle } from '@/shared/lib/usePageTitle';

const forgotPasswordBrandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-12 py-16 lg:flex lg:w-[480px] xl:w-[520px]"
    heading={
      <>
        Reset your password,
        <br />
        <span className="gradient-text-animated">securely.</span>
      </>
    }
    description="We'll email you a one-time reset link. It takes less than a minute to regain access."
    features={[
      { icon: FaLock, text: 'Private, one-time recovery link' },
      { icon: FaClock, text: 'Latest link wins automatically' },
      { icon: FaShieldAlt, text: 'Neutral responses protect your privacy' },
    ]}
    stats={[
      { value: '<1 min', label: 'Recovery time' },
      { value: '15 min', label: 'Link lifetime' },
      { value: '1 link', label: 'Active at a time' },
    ]}
  />
);

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
