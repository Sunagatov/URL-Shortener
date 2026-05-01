import { FaExclamationTriangle, FaLock, FaShieldAlt } from 'react-icons/fa';
import { routes } from '@/app/routes';
import {
  AuthBackLink,
  AuthPrimaryLink,
  AuthStatusIcon,
  AuthStatusView,
  AuthSupportCard,
} from '@/features/auth/ui/AuthFlowElements';

export function ResetPasswordMissingTokenState() {
  return (
    <AuthStatusView
      title="Token missing"
      description="The recovery link you followed is missing information or has already been cleaned up. Request a fresh one to continue."
      icon={(
        <AuthStatusIcon badge="error">
          <FaExclamationTriangle className="h-8 w-8 text-red-400" />
        </AuthStatusIcon>
      )}
      action={(
        <>
          <AuthPrimaryLink to={routes.forgotPassword}>Request a new reset link</AuthPrimaryLink>
          <div className="text-center">
            <AuthBackLink to={routes.signIn}>Back to Sign In</AuthBackLink>
          </div>
        </>
      )}
    />
  );
}

export function ResetPasswordSuccessState() {
  return (
    <AuthStatusView
      title="You can sign in now"
      description="You can now sign in with your new password. Older recovery links no longer work."
      icon={(
        <AuthStatusIcon badge="success">
          <FaShieldAlt className="h-8 w-8 text-emerald-400" />
        </AuthStatusIcon>
      )}
      action={(
        <>
          <AuthSupportCard>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Your password manager can now save this update the next time you sign in.
            </p>
          </AuthSupportCard>
          <AuthPrimaryLink to={routes.signIn}>
            <>
              <FaLock className="h-4 w-4" />
              Continue to Sign In
            </>
          </AuthPrimaryLink>
        </>
      )}
    />
  );
}
