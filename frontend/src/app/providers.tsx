import type { PropsWithChildren } from 'react';
import { AuthProvider } from '@/shared/auth/AuthProvider';

export function Providers({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
