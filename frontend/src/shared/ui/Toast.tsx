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
    error:   (message: string) => void;
    info:    (message: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
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
    const s    = STYLES[toast.type];

    return (
        <div
            className={`
                relative flex items-start gap-3 w-80 px-4 py-3.5 rounded-2xl
                bg-[#0d0f1c]/95 backdrop-blur-xl border ${s.border}
                shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                ${toast.leaving ? 'toast-leave' : 'toast-enter'}
            `}
        >
            {/* Progress bar */}
            <div
                className={`absolute bottom-0 left-0 h-[2px] rounded-b-2xl ${s.bar} opacity-40`}
                style={{ animation: 'toast-progress 3.5s linear forwards' }}
            />

            {/* Icon */}
            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${s.icon}`}>
                <Icon className="w-3 h-3" />
            </div>

            {/* Message */}
            <p className="flex-1 text-sm text-white/85 leading-snug pt-0.5">{toast.message}</p>

            {/* Dismiss */}
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-white/25 hover:text-white/60 transition-colors mt-0.5 flex-shrink-0"
                aria-label="Dismiss"
            >
                <FaTimes className="w-3 h-3" />
            </button>
        </div>
    );
};

// ─── Provider ─────────────────────────────────────────────────────────────────

const DURATION = 3500;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const dismiss = useCallback((id: string) => {
        // Mark as leaving to trigger exit animation
        setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
        // Remove after animation completes
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 250);
        const timer = timers.current.get(id);
        if (timer) { clearTimeout(timer); timers.current.delete(id); }
    }, []);

    const push = useCallback((type: ToastType, message: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev.slice(-3), { id, type, message, leaving: false }]);
        const timer = setTimeout(() => dismiss(id), DURATION);
        timers.current.set(id, timer);
    }, [dismiss]);

    const api: ToastContextValue = {
        success: (msg) => push('success', msg),
        error:   (msg) => push('error',   msg),
        info:    (msg) => push('info',    msg),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}

            {/* Portal-style fixed container */}
            <div
                aria-live="polite"
                className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none"
            >
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastCard toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
