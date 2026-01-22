'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { X, CreditCard, User, MapPin } from 'lucide-react';
import { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear cart and close modal
    clearCart();
    closeCheckout();
    setIsProcessing(false);
    
    // Show success message (you could add a toast here)
    alert('Order placed successfully!');
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

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <User size={16} />
                      Contact Information
                    </label>
                    <input
                      type="email"
                      placeholder="Email address"
                      required
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-calm/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Shipping Address
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full name"
                        required
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-calm/50 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        required
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-calm/50 transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          required
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-calm/50 transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="ZIP code"
                          required
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-calm/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <CreditCard size={16} />
                      Payment Information
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Card number"
                        required
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-calm/50 transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          required
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-calm/50 transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          required
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-calm/50 transition-colors"
                        />
                      </div>
                    </div>
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
                    type="submit"
                    disabled={isProcessing}
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                    className="w-full py-3 bg-calm hover:bg-calm/90 disabled:bg-calm/50 text-white font-medium rounded-xl transition-colors"
                  >
                    {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};