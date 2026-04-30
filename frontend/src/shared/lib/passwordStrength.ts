export type PasswordStrength = {
  barClass: string;
  strength: 'Weak' | 'Medium' | 'Strong';
  textClass: string;
  width: string;
};

const MIN_PASSWORD_LENGTH = 15;
const STRONG_PASSWORD_LENGTH = 20;

export const passwordChecks = [
  {
    getLabel: () => '15+ characters',
    isValid: (value: string) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    getLabel: () => '20+ for extra margin',
    isValid: (value: string) => value.length >= STRONG_PASSWORD_LENGTH,
  },
  {
    getLabel: () => 'More than one unique character',
    isValid: (value: string) => new Set(value).size > 1,
  },
  {
    getLabel: () => 'Passphrase-friendly spacing or separators',
    isValid: (value: string) => /[\s\-_.]/.test(value),
  },
] as const;

export function getPasswordStrength(password: string): PasswordStrength {
  const uniqueCharacters = new Set(password).size;
  const hasPassphrasePattern = /[\s\-_.]/.test(password);
  const longEnough = password.length >= MIN_PASSWORD_LENGTH;
  const longAndVaried =
    password.length >= STRONG_PASSWORD_LENGTH && (uniqueCharacters >= 10 || hasPassphrasePattern);

  if (!longEnough) {
    return {
      strength: 'Weak',
      width: '28%',
      textClass: 'text-red-400',
      barClass: 'bg-red-500',
    };
  }

  if (!longAndVaried) {
    return {
      strength: 'Medium',
      width: '68%',
      textClass: 'text-amber-400',
      barClass: 'bg-amber-500',
    };
  }

  return {
    strength: 'Strong',
    width: '100%',
    textClass: 'text-emerald-400',
    barClass: 'bg-emerald-500',
  };
}
