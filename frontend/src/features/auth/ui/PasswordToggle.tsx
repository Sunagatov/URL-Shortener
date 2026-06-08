import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-secondary)]"
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
    </button>
  );
}

export function usePasswordVisibility() {
  const [visible, setVisible] = useState(false);
  return {
    visible,
    toggle: () => setVisible(v => !v),
    type: visible ? ('text' as const) : ('password' as const),
  };
}
