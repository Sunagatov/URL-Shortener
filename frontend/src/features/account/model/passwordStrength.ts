export type PasswordStrength = {
  barClass: string;
  strength: 'Weak' | 'Medium' | 'Strong';
  textClass: string;
  width: string;
};

export const passwordChecks = [
  { getLabel: () => '8+ characters', isValid: (value: string) => value.length >= 8 },
  { getLabel: () => 'Uppercase letter', isValid: (value: string) => /[A-Z]/.test(value) },
  { getLabel: () => 'Number', isValid: (value: string) => /\d/.test(value) },
  {
    getLabel: () => 'Special char',
    isValid: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
] as const;

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  if (score < 2) {
    return {
      strength: 'Weak',
      width: '20%',
      textClass: 'text-red-400',
      barClass: 'bg-red-500',
    };
  }

  if (score < 4) {
    return {
      strength: 'Medium',
      width: '60%',
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
