'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export const Notification = () => {
  const { notification, clearNotification } = useMarketStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 glass-card rounded-lg p-4 max-w-sm"
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle size={20} className="text-calm flex-shrink-0" />
            ) : (
              <XCircle size={20} className="text-rose-400 flex-shrink-0" />
            )}
            <p className="text-white/90 text-sm flex-1">{notification.message}</p>
            <button
              onClick={clearNotification}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X size={16} className="text-white/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};