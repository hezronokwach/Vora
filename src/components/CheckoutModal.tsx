'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { X, CreditCard, User, MapPin } from 'lucide-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const { cart, closeCheckout, clearCart, emotionData } = useMarketStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate emotion discount
  const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
  const maxStress = Math.max(...stressEmotions.map(e => emotionData[e] || 0));
  const emotionDiscount = Math.min(Math.round(maxStress * 25), 25);
  const discountAmount = (subtotal * emotionDiscount) / 100;
  const total = subtotal - discountAmount;

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          emotionDiscount,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe redirect error:', error);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    closeCheckout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
                    <CreditCard size={20} />
                    Checkout
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-white/70" />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-white/70">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {emotionDiscount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between text-calm"
                      >
                        <span>Empathy Discount ({emotionDiscount}%)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </motion.div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold text-white/90 pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {emotionDiscount > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-calm/80 mb-4 text-center"
                    >
                      We noticed you might be having a tough day. This discount is our way of sending some comfort your way! 💙
                    </motion.p>
                  )}

                  <motion.button
                    type="button"
                    onClick={handleStripeCheckout}
                    disabled={isProcessing}
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                    className="w-full py-3 bg-calm hover:bg-calm/90 disabled:bg-calm/50 text-white font-medium rounded-xl transition-colors"
                  >
                    {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)} with Stripe`}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};