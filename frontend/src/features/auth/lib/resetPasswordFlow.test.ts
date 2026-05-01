import {
  getResetPasswordSubmitDisabled,
  getResetPasswordValidationError,
  passwordsMatch,
} from '@/features/auth/lib/resetPasswordFlow';

describe('resetPasswordFlow helpers', () => {
  it('checks whether passwords match', () => {
    expect(passwordsMatch('secret phrase', '')).toBe(true);
    expect(passwordsMatch('secret phrase', 'secret phrase')).toBe(true);
    expect(passwordsMatch('secret phrase', 'different')).toBe(false);
  });

  it('returns mismatch before weak-password validation', () => {
    expect(
      getResetPasswordValidationError({
        newPassword: 'correct horse battery staple',
        confirmPassword: 'different phrase',
        isWeakPassword: false,
      }),
    ).toBe('Passwords do not match.');
  });

  it('returns the weak-password message when passwords match but remain weak', () => {
    expect(
      getResetPasswordValidationError({
        newPassword: 'short password',
        confirmPassword: 'short password',
        isWeakPassword: true,
      }),
    ).toBe('Use at least 15 characters. A passphrase or password manager works well.');
  });

  it('returns an empty validation message when the form is valid', () => {
    expect(
      getResetPasswordValidationError({
        newPassword: 'correct horse battery staple',
        confirmPassword: 'correct horse battery staple',
        isWeakPassword: false,
      }),
    ).toBe('');
  });

  it('computes submit disabled state from weak or mismatched passwords', () => {
    expect(
      getResetPasswordSubmitDisabled({
        newPassword: 'short password',
        confirmPassword: 'short password',
        isWeakPassword: true,
      }),
    ).toBe(true);

    expect(
      getResetPasswordSubmitDisabled({
        newPassword: 'correct horse battery staple',
        confirmPassword: 'different',
        isWeakPassword: false,
      }),
    ).toBe(true);

    expect(
      getResetPasswordSubmitDisabled({
        newPassword: 'correct horse battery staple',
        confirmPassword: '',
        isWeakPassword: false,
      }),
    ).toBe(false);
  });
});
