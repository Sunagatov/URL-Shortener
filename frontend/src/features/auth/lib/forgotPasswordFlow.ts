export const RESEND_COOLDOWN_SECONDS = 30;

export type RecoveryRequestMode = 'initial' | 'resend';

export function getRecoverySuccessNotice(mode: RecoveryRequestMode) {
  return mode === 'resend' ? 'If that account exists, we sent a fresh recovery email.' : '';
}

export function getRecoveryNetworkFailureMessage(mode: RecoveryRequestMode) {
  return mode === 'initial'
    ? 'We could not reach the server. Please check your connection and try again.'
    : 'We could not send another email right now. Please try again shortly.';
}

export function tickCooldown(seconds: number) {
  return seconds <= 1 ? 0 : seconds - 1;
}
