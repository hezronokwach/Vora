'use client';

import { motion } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { Heart, Zap, Smile, Frown } from 'lucide-react';

export const EmotionMeter = () => {
  const emotionData = useMarketStore(state => state.emotionData);

  // Calculate emotion discount
  const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
  const maxStress = Math.max(...stressEmotions.map(e => emotionData[e] || 0));
  const emotionDiscount = Math.min(Math.round(maxStress * 25), 25);

  // Get dominant emotion
  const emotions = Object.entries(emotionData).sort(([, a], [, b]) => b - a);
  const dominantEmotion = emotions[0];

  const getEmotionIcon = (emotion: string) => {
    if (['joy', 'happiness', 'contentment'].includes(emotion)) return <Smile size={16} />;
    if (['distress', 'sadness', 'frustration'].includes(emotion)) return <Frown size={16} />;
    if (['excitement', 'enthusiasm'].includes(emotion)) return <Zap size={16} />;
    return <Heart size={16} />;
  };

  const getEmotionColor = (emotion: string) => {
    if (['joy', 'happiness', 'contentment'].includes(emotion)) return 'text-green-400';
    if (['distress', 'sadness', 'frustration'].includes(emotion)) return 'text-rose-400';
    if (['excitement', 'enthusiasm'].includes(emotion)) return 'text-amber-400';
    return 'text-calm';
  };

  if (!dominantEmotion || Object.keys(emotionData).length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/80">Emotion Meter</h3>
        {emotionDiscount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-calm/20 text-calm px-2 py-1 rounded-full text-xs font-medium"
          >
            {emotionDiscount}% discount available
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className={`${getEmotionColor(dominantEmotion[0])}`}>
          {getEmotionIcon(dominantEmotion[0])}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/90 capitalize">
              {dominantEmotion[0]}
            </span>
            <span className="text-xs text-white/60">
              {Math.round(dominantEmotion[1] * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dominantEmotion[1] * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-2 rounded-full ${
                ['distress', 'sadness', 'frustration'].includes(dominantEmotion[0])
                  ? 'bg-rose-400'
                  : ['joy', 'happiness', 'contentment'].includes(dominantEmotion[0])
                  ? 'bg-green-400'
                  : 'bg-calm'
              }`}
            />
          </div>
        </div>
      </div>

      {emotionDiscount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-calm/80 mt-3 text-center"
        >
          We sense you might need some comfort. Enjoy a special discount! 💙
        </motion.p>
      )}
    </motion.div>
  );
};