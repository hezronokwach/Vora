'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const clearCart = useMarketStore(state => state.clearCart);

  useEffect(() => {
    // Clear cart on successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={32} className="text-green-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white/90 mb-4">
          Order Successful!
        </h1>
        
        <p className="text-white/70 mb-6">
          Thank you for your purchase. Your order has been processed successfully and you'll receive a confirmation email shortly.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-calm hover:bg-calm/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}