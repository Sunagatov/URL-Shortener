import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    leaving: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const noop = () => {};

const defaultToastContext: ToastContextValue = {
    success: noop,
    error: noop,
    info: noop,
};

const ToastContext = createContext<ToastContextValue>(defaultToastContext);

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useToast = (): ToastContextValue => {
  return useContext(ToastContext);
};

// ─── Single toast component ───────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ElementType> = {
    success: FaCheck,
    error:   FaExclamationTriangle,
    info:    FaInfoCircle,
};

const STYLES: Record<ToastType, { icon: string; bar: string; border: string }> = {
    success: {
        icon:   'bg-blue-600/20 border-blue-500/30 text-blue-400',
        bar:    'bg-blue-500',
        border: 'border-blue-500/15',
    },
    error: {
        icon:   'bg-red-600/20 border-red-500/30 text-red-400',
        bar:    'bg-red-500',
        border: 'border-red-500/15',
    },
    info: {
        icon:   'bg-white/10 border-white/20 text-white/60',
        bar:    'bg-white/40',
        border: 'border-white/10',
    },
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const Icon = ICONS[toast.type];
  const style = STYLES[toast.type];

  return (
    <div
      className={`relative flex w-80 items-start gap-3 rounded-[24px] border px-4 py-3.5 backdrop-blur-xl ${
        style.border
      } bg-[color:var(--surface-overlay)] shadow-[0_20px_40px_rgba(4,10,24,0.42)] ${
        toast.leaving ? 'toast-leave' : 'toast-enter'
      }`}
    >
      <div
        className={`absolute bottom-0 left-0 h-[2px] rounded-b-[24px] ${style.bar} opacity-50`}
        style={{ animation: 'toast-progress 3.5s linear forwards' }}
      />
      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl border ${style.icon}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="flex-1 pt-0.5 text-sm leading-snug text-[color:var(--text-primary)]">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 flex-shrink-0 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-primary)]"
        aria-label="Dismiss"
      >
        <FaTimes className="h-3 w-3" />
      </button>
    </div>
  );
};

// ─── Provider ─────────────────────────────────────────────────────────────────

const DURATION = 3500;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const removalTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const nextToastId = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));

    const removalTimer = setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      removalTimers.current.delete(id);
    }, 250);

    removalTimers.current.set(id, removalTimer);

    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      nextToastId.current += 1;
      const id = `toast-${nextToastId.current}`;
      setToasts((current) => [...current.slice(-3), { id, type, message, leaving: false }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION));
    },
    [dismiss],
  );

  React.useEffect(() => {
    const toastTimers = timers.current;
    const toastRemovalTimers = removalTimers.current;

    return () => {
      toastTimers.forEach(clearTimeout);
      toastRemovalTimers.forEach(clearTimeout);
      toastTimers.clear();
      toastRemovalTimers.clear();
    };
  }, []);

  const api: ToastContextValue = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    info: (message) => push('info', message),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
