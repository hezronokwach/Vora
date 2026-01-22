'use client';

import { useAuraStore } from '@/store/useAuraStore';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

export const StressChart = () => {
    const sessionHistory = useAuraStore((state) => state.sessionHistory);
    const stressScore = useAuraStore((state) => state.stressScore);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const chartColor = useMemo(() => {
        if (stressScore < 30) return 'var(--calm)';
        if (stressScore < 70) return 'var(--alert)';
        return 'var(--stressed)';
    }, [stressScore]);

    // If not mounted or no history, show placeholder
    if (!isMounted || sessionHistory.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center glass rounded-[2rem] border border-white/5">
                <p className="text-sm opacity-30 italic">No session data available yet. Start talking to see your stress trends.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-80 glass p-6 rounded-[2.5rem] border border-white/10 shadow-xl overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6 px-2">
                <div>
                    <h3 className="text-lg font-bold tracking-tight">Stress Trends</h3>
                    <p className="text-xs opacity-40 uppercase tracking-widest font-bold">Real-time Session Analysis</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-calm" />
                        <span className="text-[10px] opacity-40 font-bold uppercase">Calm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-stressed" />
                        <span className="text-[10px] opacity-40 font-bold uppercase">Stressed</span>
                    </div>
                </div>
            </div>

            <div className="h-56 w-full pr-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sessionHistory}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                            minTickGap={30}
                        />
                        <YAxis
                            hide
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '1rem',
                                fontSize: '12px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: chartColor }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke={chartColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
