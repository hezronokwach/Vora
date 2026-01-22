'use client';

import { ProductGrid } from '@/components/ProductGrid';
import { CartSidebar } from '@/components/CartSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { VoiceController } from '@/components/VoiceController';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { AmbientBackground } from '@/components/AmbientBackground';
import { useMarketStore } from '@/store/useMarketStore';
import { useEffect } from 'react';
import { getProducts } from '@/lib/sanity';
import { ShoppingCart, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { 
    products, 
    setProducts, 
    cart, 
    cartOpen, 
    setCartOpen, 
    checkoutOpen,
    filterOpen,
    setFilterOpen 
  } = useMarketStore();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    
    if (products.length === 0) {
      loadProducts();
    }
  }, [products.length, setProducts]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <AmbientBackground />
      
      <main className="min-h-screen bg-transparent text-white relative z-0">
        {/* Header */}
        <header className="w-full border-b border-white/10 bg-black/20 backdrop-blur-xl z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/20">
                <img src="/logo.png" alt="Vora Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Vora</h1>
                <p className="text-xs text-white/60">Empathic Shopping</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterOpen(!filterOpen)}
                data-testid="filter-button"
                className="p-2 glass-card rounded-xl hover:bg-white/10 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCartOpen(!cartOpen)}
                data-testid="cart-button"
                className="relative p-2 glass-card rounded-xl hover:bg-white/10 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span 
                    data-testid="cart-badge"
                    className="absolute -top-1 -right-1 bg-calm text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  >
                    {cartItemCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </header>

        <div className="flex max-w-7xl mx-auto">
          {/* Filter Sidebar */}
          <FilterSidebar />
          
        <div className="flex-1 px-6 py-8">
          <div className="flex flex-col gap-8">
            {/* Products */}
            <div className="flex-1">
              <ProductGrid />
            </div>
            
            {/* Voice Controller & Analytics */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <VoiceController />
              </div>
              <div className="flex-1">
                <AnalyticsDashboard />
              </div>
            </div>
          </div>
        </div>
        </div>
        
        {/* Cart Sidebar */}
        <CartSidebar />
        
        {/* Checkout Modal */}
        {checkoutOpen && <CheckoutModal />}
      </main>
    </>
  );
}
