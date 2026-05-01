import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountSidebarCards } from '@/features/account/ui/AccountSidebarCards';
import { EditProfileForm } from '@/features/account/ui/EditProfileForm';
import { UserProfileCard } from '@/features/account/ui/UserProfileCard';
import { useUserProfile } from '@/features/account/model/useUserProfile';
import {
  AccountPageHeader,
  AccountPageLayout,
  AccountPageLoadingState,
  AccountPageMessageState,
} from '@/features/account/ui/layout/AccountPageLayout';
import type { User } from '@/shared/auth/types';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { routes } from '@/app/routes';

const UserAccountPage: React.FC = () => {
  usePageTitle('My Profile');
  const navigate = useNavigate();
  const { errorMessage, isLoading, userDetails, setUserDetails } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

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

  const handleEditSuccess = (updated: User) => {
    setUserDetails(updated);
    setIsEditing(false);
  };

  return (
    <AccountPageLayout>
      <AccountPageHeader
        title="My Profile"
        description="Manage your personal information and preferences"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {isEditing ? (
          <EditProfileForm
            user={userDetails}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <UserProfileCard user={userDetails} onEdit={() => setIsEditing(true)} />
        )}
        <AccountSidebarCards
          user={userDetails}
          onEditProfile={() => setIsEditing(true)}
          onNavigate={path => navigate(path || routes.security)}
        />
      </div>
    </AccountPageLayout>
  );
};

export default UserAccountPage;
