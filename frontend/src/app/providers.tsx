import type { PropsWithChildren } from 'react';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { ToastProvider } from '@/shared/ui';

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
