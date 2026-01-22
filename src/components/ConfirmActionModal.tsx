'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmActionModalProps {
    taskName: string;
    actionType: 'postpone' | 'cancel' | 'delegate' | 'complete';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmActionModal = ({ taskName, actionType, onConfirm, onCancel }: ConfirmActionModalProps) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onConfirm();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onConfirm]);

    const actionText = {
        postpone: 'moving to tomorrow',
        cancel: 'cancelling',
        delegate: 'delegating',
        complete: 'marking as complete'
    }[actionType];

    const actionColor = {
        postpone: 'text-blue-400',
        cancel: 'text-amber-400',
        delegate: 'text-purple-400',
        complete: 'text-green-400'
    }[actionType];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-card p-6 rounded-3xl border border-white/20 max-w-md w-full relative overflow-hidden"
                >
                    {/* Progress bar */}
                    <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className="absolute top-0 left-0 right-0 h-1 bg-calm origin-left"
                    />

                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-calm/10 border border-calm/20">
                            <AlertCircle className="w-6 h-6 text-calm" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2">Aura is taking action</h3>
                            <p className="text-sm opacity-60 mb-4">
                                I noticed you're feeling overwhelmed. I'm <span className={actionColor}>{actionText}</span>{' '}
                                <span className="font-semibold">"{taskName}"</span>.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Undo ({countdown}s)
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="py-2.5 px-4 rounded-xl bg-calm/20 hover:bg-calm/30 border border-calm/30 transition-colors text-sm font-medium"
                                >
                                    Confirm Now
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
