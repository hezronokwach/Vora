'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/store/useMarketStore';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const emotionData = useMarketStore(state => state.emotionData);

  useEffect(() => {
    const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
    const engagedEmotions = ['excitement', 'enthusiasm', 'interest'];
    
    const maxStress = Math.max(...stressEmotions.map(e => emotionData[e] || 0));
    const maxEngaged = Math.max(...engagedEmotions.map(e => emotionData[e] || 0));
    
    // Remove existing theme classes
    document.body.classList.remove('theme-calm', 'theme-engaged', 'theme-stressed');
    
    // Apply theme based on dominant emotion
    if (maxStress > 0.3) {
      document.body.classList.add('theme-stressed');
    } else if (maxEngaged > 0.4) {
      document.body.classList.add('theme-engaged');
    } else {
      document.body.classList.add('theme-calm');
    }
  }, [emotionData]);

  return <>{children}</>;
};