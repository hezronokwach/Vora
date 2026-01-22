'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { X } from 'lucide-react';

export const FilterSidebar = () => {
  const { 
    filterOpen, 
    setFilterOpen, 
    filters, 
    setFilters, 
    clearFilters 
  } = useMarketStore();

  const categories = ['dresses', 'tops', 'bottoms', 'accessories', 'shoes'];
  const colors = ['red', 'blue', 'green', 'black', 'white', 'pink', 'purple', 'yellow'];
  const priceRanges = [
    { label: 'Under $25', value: 25 },
    { label: 'Under $50', value: 50 },
    { label: 'Under $100', value: 100 },
    { label: 'Under $200', value: 200 },
  ];

  const hasActiveFilters = filters.category || filters.color || filters.maxPrice;

  return (
    <AnimatePresence>
      {filterOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            data-testid="filter-sidebar"
            className="fixed lg:relative top-0 left-0 h-full lg:h-auto w-80 glass-card border-r border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Filters</h2>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearFilters}
                      className="text-xs text-calm hover:text-calm/80 transition-colors"
                    >
                      Clear All
                    </motion.button>
                  )}
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={filters.category === category}
                        onChange={(e) => setFilters({ category: e.target.value })}
                        className="w-4 h-4 text-calm bg-transparent border-white/30 focus:ring-calm focus:ring-2"
                      />
                      <span className="text-sm text-white/70 capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFilters({ 
                        color: filters.color === color ? undefined : color 
                      })}
                      className={`
                        w-8 h-8 rounded-full border-2 transition-all
                        ${filters.color === color 
                          ? 'border-calm scale-110' 
                          : 'border-white/30 hover:border-white/50'
                        }
                      `}
                      style={{ 
                        backgroundColor: color === 'white' ? '#ffffff' : color 
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value={range.value}
                        checked={filters.maxPrice === range.value}
                        onChange={(e) => setFilters({ maxPrice: Number(e.target.value) })}
                        className="w-4 h-4 text-calm bg-transparent border-white/30 focus:ring-calm focus:ring-2"
                      />
                      <span className="text-sm text-white/70">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-semibold text-white/80 mb-3">Active Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2 py-1 bg-calm/20 text-calm text-xs rounded-full border border-calm/30 flex items-center gap-1"
                      >
                        {filters.category}
                        <button
                          onClick={() => setFilters({ category: undefined })}
                          className="hover:bg-calm/30 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    )}
                    {filters.color && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2 py-1 bg-calm/20 text-calm text-xs rounded-full border border-calm/30 flex items-center gap-1"
                      >
                        {filters.color}
                        <button
                          onClick={() => setFilters({ color: undefined })}
                          className="hover:bg-calm/30 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    )}
                    {filters.maxPrice && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2 py-1 bg-calm/20 text-calm text-xs rounded-full border border-calm/30 flex items-center gap-1"
                      >
                        Under ${filters.maxPrice}
                        <button
                          onClick={() => setFilters({ maxPrice: undefined })}
                          className="hover:bg-calm/30 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};