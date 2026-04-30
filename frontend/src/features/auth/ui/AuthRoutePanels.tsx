import {
  FaChartLine,
  FaClock,
  FaEnvelope,
  FaKey,
  FaLock,
  FaRocket,
  FaShieldAlt,
} from 'react-icons/fa';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';

export const signInBrandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-12 py-16 lg:flex lg:w-[480px] xl:w-[520px]"
    heading={
      <>
        Your links,
        <br />
        <span className="gradient-text-animated">amplified.</span>
      </>
    }
    description="Shorten URLs, track performance, and share with confidence — all in one place."
    features={[
      { icon: FaRocket, text: 'Create short links in seconds' },
      { icon: FaChartLine, text: 'Track clicks and analyze traffic' },
      { icon: FaShieldAlt, text: 'Enterprise-grade link security' },
    ]}
    stats={[
      { value: '10M+', label: 'Links' },
      { value: '500K+', label: 'Users' },
      { value: '99.9%', label: 'Uptime' },
    ]}
  />
);

export const signUpBrandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-10 py-16 lg:flex lg:w-[420px] xl:w-[460px]"
    heading={
      <>
        Join 500K+
        <br />
        <span className="gradient-text-animated">link creators.</span>
      </>
    }
    description="Free forever. No credit card required. Start shortening and tracking your links in seconds."
    features={[
      { text: 'Create unlimited short links' },
      { text: 'Track clicks and performance' },
      { text: 'Secure & reliable infrastructure' },
      { text: 'Export your data anytime' },
    ]}
    footer={
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
        <p className="mb-1 text-xs text-white/25">Trusted by teams at</p>
        <p className="text-sm font-semibold text-white/45">Startups · Agencies · Developers</p>
      </div>
    }
  />
);

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
