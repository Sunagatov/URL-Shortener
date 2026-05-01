import React from 'react';
import { useChangePasswordForm } from '@/features/account/model/useChangePasswordForm';
import { PasswordChangeForm } from '@/features/account/ui/PasswordChangeForm';
import { SecurityStatusCard } from '@/features/account/ui/SecurityStatusCard';
import { AccountPageHeader, AccountPageLayout } from '@/features/account/ui/layout/AccountPageLayout';
import { usePageTitle } from '@/shared/lib/usePageTitle';

const SecurityPage: React.FC = () => {
  usePageTitle('Security');
  const form = useChangePasswordForm();

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
        <PasswordChangeForm {...form} onSubmit={form.submit} />
      </div>
    </AccountPageLayout>
  );
};

export default SecurityPage;
