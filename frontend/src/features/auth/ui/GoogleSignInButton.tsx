import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { useToast } from '@/shared/ui';
import {
  googleOAuthClientId,
  getGoogleOAuthUrl,
  getGoogleRedirectUri,
} from '@/features/auth/lib/googleOAuth';

export function GoogleSignInButton({ state }: { state?: string }) {
  const [pending, setPending] = useState(false);
  const toast = useToast();
  if (!googleOAuthClientId) return null;

  const handleClick = async () => {
    if (pending) return;
    setPending(true);
    try {
      window.location.href = await getGoogleOAuthUrl(getGoogleRedirectUri(), state);
    } catch {
      toast.error('Unable to start Google sign-in. Please try again.');
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[color:var(--border-strong)] bg-[var(--surface-raised)] px-4 py-3 text-sm font-semibold text-[color:var(--text-primary)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent-border)] hover:bg-[var(--surface-hover)]"
    >
      <FcGoogle className="h-5 w-5" />
      <span>Continue with Google</span>
    </button>
  );
}
