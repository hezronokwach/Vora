'use client';

import { motion } from 'framer-motion';
import { useMarketStore, type Product } from '@/store/useMarketStore';
import { urlFor } from '@/lib/sanity';
import { EmotionDiscountBadge } from './EmotionDiscountBadge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, emotionData, loadingStates, setLoading } = useMarketStore();

  // Calculate emotion discount for this product
  const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
  const maxStress = Math.max(...stressEmotions.map(e => emotionData[e] || 0));
  const baseDiscount = Math.min(Math.round(maxStress * 25), 25);
  
  // Apply product's emotion boost multiplier
  const emotionDiscount = Math.round(baseDiscount * (product.emotionBoost || 0.15));
  const discountedPrice = product.price * (1 - emotionDiscount / 100);

  const handleAddToCart = () => {
    setLoading(`add-${product._id}`, true);
    setTimeout(() => {
      addToCart(product, 1);
      setLoading(`add-${product._id}`, false);
    }, 300);
  };

  const isLoading = loadingStates[`add-${product._id}`] || false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      data-testid="product-card"
      className="glass-card p-3 rounded-xl group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl">
        <img 
          src={product.image ? urlFor(product.image).width(400).height(300).url() : '/placeholder.jpg'} 
          alt={product.title}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        <EmotionDiscountBadge 
          discount={emotionDiscount}
          reasoning={emotionDiscount > 0 ? "Comfort discount" : undefined}
        />
        
        {product.stock < 5 && (
          <div className="absolute top-2 right-2 bg-rose-500/80 text-white text-xs px-2 py-1 rounded-full">
            Low Stock
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <h3 className="text-base font-bold text-white/90 line-clamp-2">{product.title}</h3>
        <p className="text-sm text-white/60 mt-1 capitalize">{product.category}</p>
        
        <div className="flex items-center justify-between mt-3">
          <div>
            {emotionDiscount > 0 ? (
              <div>
                <p className="text-base text-white/60 line-through">${product.price}</p>
                <p className="text-xl font-bold text-calm">${discountedPrice.toFixed(2)}</p>
              </div>
            ) : (
              <p className="text-xl font-bold text-calm">${product.price}</p>
            )}
            <p className="text-xs text-white/40">{product.stock} in stock</p>
          </div>
          
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="px-3 py-2 bg-calm/20 hover:bg-calm/30 disabled:bg-calm/10 text-calm border border-calm/30 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-3 h-3 border border-calm/30 border-t-calm rounded-full animate-spin" />
            )}
            {isLoading ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </motion.button>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};