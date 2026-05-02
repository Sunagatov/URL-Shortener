import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  editProfileSchema,
  type EditProfileFormData,
  type EditProfileFormInput,
} from '@/features/account/model/editProfileValidation';
import { updateUserProfile } from '@/features/account/api/profileApi';
import type { User } from '@/shared/auth/types';
import { useAuth } from '@/shared/auth/useAuth';
import { useToast } from '@/shared/ui';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';

export function useEditProfileForm(
  user: User,
  onSuccess: (updated: User) => void,
  onCancel: () => void,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { updateUser } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileFormInput, unknown, EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      country: user.country ?? '',
      age: (user.age ?? '') as unknown as number,
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    setServerError('');
    try {
      const updated = await updateUserProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        country: data.country?.trim() || undefined,
        age: data.age || undefined,
      });
      updateUser(updated);
      onSuccess(updated);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err, 'Failed to update profile. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setServerError('');
    onCancel();
  };

  return {
    errors,
    handleCancel,
    handleSubmit,
    isLoading,
    onSubmit,
    register,
    serverError,
  };
}
