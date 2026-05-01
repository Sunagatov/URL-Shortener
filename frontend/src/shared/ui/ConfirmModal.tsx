import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  tone?: 'danger' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  isLoading = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = tone === 'danger';
  const Icon = isDanger ? FaExclamationTriangle : FaCheckCircle;
  const iconClassName = isDanger
    ? 'border-red-500/25 bg-red-500/10 text-red-400'
    : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400';
  const accentClassName = isDanger
    ? 'from-red-500/16 via-transparent to-transparent'
    : 'from-emerald-500/16 via-transparent to-transparent';

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ animation: 'modal-backdrop-in 0.15s ease both' }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[color:var(--border-strong)] bg-[color:var(--surface-overlay)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        style={{ animation: 'modal-in 0.2s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accentClassName}`} />
        <div className="mb-4 flex items-center justify-center">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconClassName}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <h2
          id="confirm-modal-title"
          className="mb-1.5 text-center text-base font-bold text-[color:var(--text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-[color:var(--text-secondary)]">
          {message}
        </p>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 justify-center"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            className="flex-1 justify-center"
            onClick={onConfirm}
            loading={isLoading}
          >
            {isLoading ? (isDanger ? 'Deleting…' : 'Confirming…') : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
