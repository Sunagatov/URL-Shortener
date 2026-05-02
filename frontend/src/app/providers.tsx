import type { PropsWithChildren } from 'react';
import { FrontendDiagnostics } from '@/app/FrontendDiagnostics';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { ToastProvider } from '@/shared/ui';

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <FrontendDiagnostics />
          {children}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
