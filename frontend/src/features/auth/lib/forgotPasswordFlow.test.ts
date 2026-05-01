import {
  getRecoveryNetworkFailureMessage,
  getRecoverySuccessNotice,
  RESEND_COOLDOWN_SECONDS,
  tickCooldown,
} from '@/features/auth/lib/forgotPasswordFlow';

describe('forgotPasswordFlow helpers', () => {
  it('returns the expected success notice by mode', () => {
    expect(getRecoverySuccessNotice('initial')).toBe('');
    expect(getRecoverySuccessNotice('resend')).toBe(
      'If that account exists, we sent a fresh recovery email.',
    );
  });

  it('returns the expected network failure message by mode', () => {
    expect(getRecoveryNetworkFailureMessage('initial')).toBe(
      'We could not reach the server. Please check your connection and try again.',
    );
    expect(getRecoveryNetworkFailureMessage('resend')).toBe(
      'We could not send another email right now. Please try again shortly.',
    );
  });

  it('ticks the cooldown down to zero', () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(30);
    expect(tickCooldown(5)).toBe(4);
    expect(tickCooldown(1)).toBe(0);
    expect(tickCooldown(0)).toBe(0);
  });
});
