import { FaClock, FaEnvelope, FaKey, FaLock, FaShieldAlt } from 'react-icons/fa';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';

export const forgotPasswordBrandPanel = (
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

export const resetPasswordBrandPanel = (
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

export const verifyEmailBrandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-12 py-16 lg:flex lg:w-[480px] xl:w-[520px]"
    heading={
      <>
        Check your
        <br />
        <span className="gradient-text-animated">inbox.</span>
      </>
    }
    description="We sent a 6-digit code to your email. Enter it below to activate your account."
    features={[
      { icon: FaEnvelope, text: 'Code sent to your inbox' },
      { icon: FaClock, text: 'Code expires in 10 minutes' },
      { icon: FaShieldAlt, text: 'Your account stays secure' },
    ]}
    stats={[
      { value: '6-digit', label: 'Code' },
      { value: '<10 min', label: 'Expiry' },
      { value: '99.9%', label: 'Uptime' },
    ]}
  />
);
