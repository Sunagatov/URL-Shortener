import type { PropsWithChildren } from 'react';
import { FrontendDiagnostics } from '@/app/FrontendDiagnostics';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { ToastProvider } from '@/shared/ui';

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <ToastProvider>
        <FrontendDiagnostics />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
