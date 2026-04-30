import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Delete',
    isLoading = false,
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

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            style={{ animation: 'modal-backdrop-in 0.15s ease both' }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal card */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                className="relative w-full max-w-sm rounded-2xl border border-white/[0.09] bg-[#0d0f1e] shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6"
                style={{ animation: 'modal-in 0.2s cubic-bezier(0.22,1,0.36,1) both' }}
            >
                {/* Icon */}
                <div className="mb-4 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <FaExclamationTriangle className="w-5 h-5 text-red-400" />
                    </div>
                </div>

                {/* Text */}
                <h2
                    id="confirm-modal-title"
                    className="text-center text-base font-bold text-white mb-1.5"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    {title}
                </h2>
                <p className="text-center text-sm text-white/45 leading-relaxed mb-6">
                    {message}
                </p>

                {/* Actions */}
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
                        variant="danger"
                        className="flex-1 justify-center"
                        onClick={onConfirm}
                        loading={isLoading}
                    >
                        {isLoading ? 'Deleting…' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
