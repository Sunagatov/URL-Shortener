import { FcGoogle } from 'react-icons/fc';
import { googleOAuthClientId, getGoogleOAuthUrl, getGoogleRedirectUri } from '@/features/auth/lib/googleOAuth';

export function GoogleSignInButton({ state }: { state?: string }) {
  if (!googleOAuthClientId) return null;

  const handleClick = () => {
    window.location.href = getGoogleOAuthUrl(getGoogleRedirectUri(), state);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[color:var(--border-strong)] bg-[var(--surface-raised)] px-4 py-3 text-sm font-semibold text-[color:var(--text-primary)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent-border)] hover:bg-[var(--surface-hover)]"
    >
      <FcGoogle className="h-5 w-5" />
      <span>Continue with Google</span>
    </button>
  );
}
