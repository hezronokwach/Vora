'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { X, CreditCard, User, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { updateProductStock } from '@/lib/sanity';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SqgU71SF3fQ8b3RWCEEFczUUWgQggYx1se2QtosiJ65X6x0pSz7VdQ9e7u0xkvVsaOxdOkXNPN8t5HYuyHkb1Ru005ank2fWD');

interface CheckoutModalProps {}

export const CheckoutModal = () => {
  const { cart, checkoutOpen, setCheckoutOpen, clearCart, emotionData, reduceStock } = useMarketStore();
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
      console.log('🛒 Starting checkout process...');
      console.log('Cart items:', cart);
      
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Checkout failed');
      }

      const { sessionId } = await response.json();
      console.log('✅ Stripe session created:', sessionId);
      
      // Reduce stock BEFORE getting redirect URL
      console.log('📦 About to reduce stock for items:', cart.map(item => ({ id: item._id, qty: item.quantity })));
      
      for (const item of cart) {
        console.log(`🔄 Processing stock reduction for ${item.title} (ID: ${item._id}), quantity: ${item.quantity}`);
        await updateProductStock(item._id, item.quantity);
        reduceStock(item._id, item.quantity);
      }
      
      console.log('✅ Stock reduced successfully');
      
      const stripe = await stripePromise;
      
      if (stripe && sessionId) {
        console.log('🔄 Redirecting to Stripe checkout...');
        // Get the checkout URL and redirect
        const sessionResponse = await fetch('/api/checkout-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        const { url } = await sessionResponse.json();
        
        // Clear cart and redirect
        console.log('🗑️ Clearing cart and redirecting to Stripe...');
        clearCart();
        
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCheckoutOpen(false);
  };

  return (
    <AnimatePresence>
      {checkoutOpen && (
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
            <div className="glass-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" data-testid="checkout-modal">
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

              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <div>
                        <p className="text-white/90 font-medium">{item.title}</p>
                        <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white/90">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

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
                      data-testid="emotion-discount"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};