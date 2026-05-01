export function passwordsMatch(newPassword: string, confirmPassword: string) {
  return confirmPassword.length === 0 || newPassword === confirmPassword;
}

export function getResetPasswordValidationError(params: {
  confirmPassword: string;
  isWeakPassword: boolean;
  newPassword: string;
}) {
  const { confirmPassword, isWeakPassword, newPassword } = params;

  if (newPassword !== confirmPassword) {
    return 'Passwords do not match.';
  }

  if (isWeakPassword) {
    return 'Use at least 15 characters. A passphrase or password manager works well.';
  }

  return '';
}

export function getResetPasswordSubmitDisabled(params: {
  confirmPassword: string;
  isWeakPassword: boolean;
  newPassword: string;
}) {
  return (
    params.isWeakPassword ||
    (params.confirmPassword.length > 0 && !passwordsMatch(params.newPassword, params.confirmPassword))
  );
}
