import React from 'react';
import { useChangePasswordForm } from '@/features/account/model/useChangePasswordForm';
import { PasswordChangeForm } from '@/features/account/ui/PasswordChangeForm';
import { SecurityStatusCard } from '@/features/account/ui/SecurityStatusCard';
import { AccountPageHeader, AccountPageLayout } from '@/app/layout/AccountPageLayout';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { useAuth } from '@/shared/auth/useAuth';
import { FcGoogle } from 'react-icons/fc';
import {
  getGoogleOAuthUrl,
  getGoogleRedirectUri,
  googleOAuthClientId,
} from '@/shared/auth/googleOAuth';
import { storage } from '@/shared/auth/storage';
import { useToast } from '@/shared/ui';

const SecurityPage: React.FC = () => {
  usePageTitle('Security');
  const form = useChangePasswordForm();
  const { user } = useAuth();
  const isGoogleOnly = user?.authProvider === 'GOOGLE';
  const toast = useToast();
  const linkGoogle = async () => {
    try {
      window.location.href = await getGoogleOAuthUrl(getGoogleRedirectUri(), '/account/security', {
        linkAccount: true,
        rememberMe: storage.isPersistent(),
      });
    } catch {
      toast.error('Unable to start Google linking. Please try again.');
    }
  };

  return (
    <AccountPageLayout>
      <AccountPageHeader
        title="Security"
        description="Manage your account security and password settings"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <SecurityStatusCard />
        </div>
        {isGoogleOnly ? (
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-6">
              <div className="flex items-center gap-3 mb-3">
                <FcGoogle className="h-6 w-6" />
                <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                  Google Account
                </h3>
              </div>
              <p className="text-sm text-[color:var(--text-muted)]">
                Your account is secured through Google sign-in. Password management is handled by
                your Google account.
              </p>
            </div>
          </div>
        ) : (
          <PasswordChangeForm {...form} onSubmit={form.submit} />
        )}
      </div>
      {!isGoogleOnly && googleOAuthClientId ? (
        <section className="mt-5 rounded-2xl border border-[color:var(--card-border)] p-6">
          <h2 className="font-semibold">Link Google sign-in</h2>
          <p className="my-3 text-sm text-[color:var(--text-muted)]">
            Sign in with your email and password first, then link the Google account using the same
            email within five minutes. If your email has not been verified, reset your password
            first.
          </p>
          <button
            type="button"
            onClick={linkGoogle}
            className="font-semibold text-[color:var(--accent)]"
          >
            Link Google account
          </button>
        </section>
      ) : null}
    </AccountPageLayout>
  );
};

export default SecurityPage;
