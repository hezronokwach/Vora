'use client';

import { useMarketStore } from '@/store/useMarketStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';

export const ProductGrid = () => {
  const products = useMarketStore(state => state.products);
  const filters = useMarketStore(state => state.filters);

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    if (filters.color && !product.tags.some(tag => 
      tag.toLowerCase().includes(filters.color!.toLowerCase())
    )) return false;
    return true;
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white/90">
          Products {filteredProducts.length > 0 && `(${filteredProducts.length})`}
        </h2>
        
        {(filters.category || filters.color || filters.maxPrice) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => useMarketStore.getState().clearFilters()}
            className="text-sm text-calm hover:text-calm/80 transition-colors"
          >
            Clear Filters
          </motion.button>
        )}
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white/90 mb-2">No products found</h3>
            <p className="text-white/60 mb-4">
              Try adjusting your filters or browse all products
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => useMarketStore.getState().clearFilters()}
              className="px-4 py-2 bg-calm/20 hover:bg-calm/30 text-calm border border-calm/30 rounded-xl transition-colors"
            >
              Clear Filters
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};