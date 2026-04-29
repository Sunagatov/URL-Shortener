import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AccountPageHeader,
  AccountPageLayout,
  AccountPageLoadingState,
  AccountPageMessageState,
} from '@/app/layout/AccountPageLayout';
import { AccountSidebarCards } from '@/features/account/ui/AccountSidebarCards';
import { UserProfileCard } from '@/features/account/ui/UserProfileCard';
import { useUserProfile } from '@/features/account/model/useUserProfile';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { routes } from '@/app/routes';

const UserAccountPage: React.FC = () => {
  usePageTitle('My Profile');
  const navigate = useNavigate();
  const { errorMessage, isLoading, userDetails } = useUserProfile();

  if (isLoading) {
    return <AccountPageLoadingState message="Loading profile…" />;
  }

  if (!userDetails) {
    return (
      <AccountPageMessageState
        title="Profile unavailable"
        message="Unable to load user details."
        detail={errorMessage}
      />
    );
  }

  return (
    <AccountPageLayout>
      <AccountPageHeader
        title="My Profile"
        description="Manage your personal information and preferences"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <UserProfileCard user={userDetails} />
        <AccountSidebarCards
          user={userDetails}
          onNavigate={path => navigate(path || routes.security)}
        />
      </div>
    </AccountPageLayout>
  );
};

export default UserAccountPage;
