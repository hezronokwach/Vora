'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface EmotionDiscountBadgeProps {
  discount: number;
  reasoning?: string;
}

export const EmotionDiscountBadge = ({ discount, reasoning }: EmotionDiscountBadgeProps) => {
  if (discount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute top-2 left-2 bg-gradient-to-r from-calm/90 to-calm/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg"
    >
      <Heart size={12} className="text-white/90" />
      {discount}% off
    </motion.div>
  );
};