'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { urlFor } from '@/lib/sanity';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

interface CartSidebarProps {}

export const CartSidebar = () => {
  const { cart, cartOpen, setCartOpen, updateCartQuantity, removeFromCart, setCheckoutOpen, emotionData, loadingStates, setLoading } = useMarketStore();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate emotion discount (0-25% based on stress/frustration)
  const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
  const maxStress = Math.max(...stressEmotions.map(e => emotionData[e] || 0));
  const emotionDiscount = Math.min(Math.round(maxStress * 25), 25);
  const discountAmount = (subtotal * emotionDiscount) / 100;
  const total = subtotal - discountAmount;

  const handleCheckout = () => {
    setCheckoutOpen(true);
    setCartOpen(false);
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 glass-card border-l border-white/10 z-50 flex flex-col"
            data-testid="cart-sidebar"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
                  <ShoppingBag size={20} />
                  Cart ({cart.length})
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white/70" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <img
                        src={item.image ? urlFor(item.image).width(80).height(80).url() : '/placeholder.jpg'}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-white/90 text-sm line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-calm font-bold">${item.price}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <Minus size={14} className="text-white/70" />
                            </button>
                            <span className="text-white/90 text-sm w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <Plus size={14} className="text-white/70" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => {
                              setLoading(`remove-${item._id}`, true);
                              setTimeout(() => {
                                removeFromCart(item._id);
                                setLoading(`remove-${item._id}`, false);
                              }, 200);
                            }}
                            disabled={loadingStates[`remove-${item._id}`]}
                            className="text-rose-400 hover:text-rose-300 disabled:text-rose-400/50 text-xs transition-colors flex items-center gap-1"
                          >
                            {loadingStates[`remove-${item._id}`] && (
                              <div className="w-3 h-3 border border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                            )}
                            {loadingStates[`remove-${item._id}`] ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10">
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
                    You seem stressed. Here's a little comfort discount! 💙
                  </motion.p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full py-3 bg-calm hover:bg-calm/90 text-white font-medium rounded-xl transition-colors"
                >
                  Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};