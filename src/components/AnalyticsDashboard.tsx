'use client';

import { motion } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, ShoppingCart, Heart, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SessionData {
  time: string;
  emotionScore: number;
  cartValue: number;
  discountApplied: number;
}

export const AnalyticsDashboard = () => {
  const { cart, emotionData } = useMarketStore();
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);

  const cartValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
  const currentEmotionScore = Math.max(...stressEmotions.map(e => emotionData[e] || 0)) * 100;
  const currentDiscount = Math.min(Math.round(currentEmotionScore * 0.25), 25);

  // Update session history every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(emotionData).length > 0) {
        const newDataPoint: SessionData = {
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          emotionScore: currentEmotionScore,
          cartValue,
          discountApplied: currentDiscount,
        };

        setSessionHistory(prev => [...prev.slice(-19), newDataPoint]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [emotionData, cartValue, currentEmotionScore, currentDiscount]);

  const totalSavings = sessionHistory.reduce((sum, data) => 
    sum + (data.cartValue * data.discountApplied / 100), 0
  );

  const avgEmotionScore = sessionHistory.length > 0 
    ? sessionHistory.reduce((sum, data) => sum + data.emotionScore, 0) / sessionHistory.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white/90">Analytics Dashboard</h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-white/60"
        >
          Session tracking • Real-time updates
        </motion.div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-calm/20 rounded-lg">
              <Heart size={20} className="text-calm" />
            </div>
            <div>
              <p className="text-xs text-white/60">Current Emotion</p>
              <p className="text-lg font-bold text-white/90">
                {currentEmotionScore.toFixed(0)}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <ShoppingCart size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Cart Value</p>
              <p className="text-lg font-bold text-white/90">
                ${cartValue.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Total Savings</p>
              <p className="text-lg font-bold text-white/90">
                ${totalSavings.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <TrendingUp size={20} className="text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Avg Emotion</p>
              <p className="text-lg font-bold text-white/90">
                {avgEmotionScore.toFixed(0)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Score Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
            <Heart size={18} className="text-calm" />
            Emotion Score Over Time
          </h3>
          
          {sessionHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sessionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="emotionScore" 
                  stroke="#14b8a6" 
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/50">
              Start shopping to see emotion trends
            </div>
          )}
        </motion.div>

        {/* Cart Value Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
            <ShoppingCart size={18} className="text-amber-400" />
            Cart Value & Discounts
          </h3>
          
          {sessionHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="cartValue" fill="#fbbf24" />
                <Bar dataKey="discountApplied" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/50">
              Add items to cart to see value trends
            </div>
          )}
        </motion.div>
      </div>

      {/* Session Summary */}
      {sessionHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-bold text-white/90 mb-4">Session Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white/60">Data Points Collected</p>
              <p className="text-white/90 font-medium">{sessionHistory.length}</p>
            </div>
            <div>
              <p className="text-white/60">Peak Emotion Score</p>
              <p className="text-white/90 font-medium">
                {Math.max(...sessionHistory.map(d => d.emotionScore)).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-white/60">Max Discount Applied</p>
              <p className="text-white/90 font-medium">
                {Math.max(...sessionHistory.map(d => d.discountApplied))}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};