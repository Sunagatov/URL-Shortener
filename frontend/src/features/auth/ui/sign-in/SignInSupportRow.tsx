import { Link } from 'react-router-dom';
import { routes } from '@/app/routes';
import { AuthCheckboxField } from '@/features/auth/ui/AuthCheckboxField';

export function SignInSupportRow() {
  return (
    <div className="flex items-center justify-between pt-1">
      <AuthCheckboxField
        id="remember-me"
        label="Remember me"
        description="Keep this browser signed in on devices you trust."
      />
      <Link
        to={routes.forgotPassword}
        className="text-sm text-white/40 transition-colors hover:text-white/70"
      >
        Forgot password?
      </Link>
    </div>
  );
}
