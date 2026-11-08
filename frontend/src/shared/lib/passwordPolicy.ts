export const normalizePassword = (value: string): string => value.normalize('NFC');
export const passwordLength = (value: string): number =>
  Array.from(normalizePassword(value)).length;

// Fast local feedback. The backend additionally checks its bundled 10,001-entry blocklist.
export function getNewPasswordError(value: string): string | null {
  const normalized = normalizePassword(value);
  if (Array.from(value).some(char => char.length === 1 && /[\uD800-\uDFFF]/.test(char)))
    return 'Password contains invalid Unicode characters';
  const length = passwordLength(normalized);
  if (length < 15) return 'Password must be at least 15 characters';
  if (length > 64) return 'Password must be 64 characters or less';
  if (/^(password|qwerty|letmein|123456|welcome|admin){1,4}[\d\W_]*$/i.test(normalized))
    return 'Choose a less common password or a longer unique passphrase';
  return null;
}
