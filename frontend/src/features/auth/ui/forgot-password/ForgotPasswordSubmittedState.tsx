import { FaCheck, FaEnvelope, FaInbox } from 'react-icons/fa';
import { routes } from '@/app/routes';
import {
  AuthBackLink,
  AuthStatusIcon,
  AuthStatusView,
  AuthSupportCard,
} from '@/features/auth/ui/AuthFlowElements';
import { Button } from '@/shared/ui';

const recoveryHints = [
  'Look in your inbox, spam, and promotions folders',
  'The newest recovery link automatically replaces older ones',
  'Keep this tab open while you check your email',
];

type ForgotPasswordSubmittedStateProps = {
  cooldownSeconds: number;
  inlineNotice: string;
  isResending: boolean;
  submittedEmail: string;
  onResend: (email: string) => Promise<void>;
  onReset: (email: string) => void;
};

export function ForgotPasswordSubmittedState({
  cooldownSeconds,
  inlineNotice,
  isResending,
  submittedEmail,
  onResend,
  onReset,
}: ForgotPasswordSubmittedStateProps) {
  return (
    <AuthStatusView
      title="Recovery requested"
      description={(
        <>
          <p className="text-sm text-white/40">Recovery requested for</p>
          <p className="mt-1 break-all text-sm font-semibold text-white">{submittedEmail}</p>
        </>
      )}
      icon={(
        <AuthStatusIcon badge="success">
          <FaInbox className="h-8 w-8 text-emerald-400" />
        </AuthStatusIcon>
      )}
      action={(
        <>
          <AuthSupportCard>
            <div className="space-y-3">
              {recoveryHints.map((hint) => (
                <div key={hint} className="flex items-start gap-2.5 text-sm text-white/45">
                  <FaCheck className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500/70" />
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          </AuthSupportCard>

          {inlineNotice ? (
            <AuthSupportCard>
              <p className="text-sm text-[color:var(--text-secondary)]">{inlineNotice}</p>
            </AuthSupportCard>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => void onResend(submittedEmail)}
              loading={isResending}
              disabled={cooldownSeconds > 0}
            >
              <FaEnvelope className="h-4 w-4" />
              <span>{cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend email'}</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => onReset(submittedEmail)}
            >
              Try a different email
            </Button>
          </div>

          <div className="text-center">
            <AuthBackLink to={routes.signIn}>Back to Sign In</AuthBackLink>
          </div>
        </>
      )}
    />
  );
}
