'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '@/store/useAuraStore';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export const FeedbackToast = () => {
    const feedbackMessage = useAuraStore((state) => state.feedbackMessage);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-calm" />,
        info: <Info className="w-5 h-5 text-alert" />,
        warning: <AlertCircle className="w-5 h-5 text-stressed" />,
    };

    const colors = {
        success: 'bg-calm/10 border-calm/20 text-calm',
        info: 'bg-alert/10 border-alert/20 text-alert',
        warning: 'bg-stressed/10 border-stressed/20 text-stressed',
    };

    return (
        <AnimatePresence>
            {feedbackMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-full glass border ${colors[feedbackMessage.type]} shadow-2xl backdrop-blur-xl`}>
                        {icons[feedbackMessage.type]}
                        <span className="font-semibold text-sm tracking-tight">
                            {feedbackMessage.text}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
