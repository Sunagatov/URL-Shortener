import { useContext } from 'react';
import { AuthContext } from '@/shared/auth/AuthProvider';
import type { AuthContextType } from '@/shared/auth/types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
