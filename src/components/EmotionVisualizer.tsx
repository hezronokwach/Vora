'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface EmotionVisualizerProps {
    emotions: Record<string, number>;
}

export const EmotionVisualizer = ({ emotions }: EmotionVisualizerProps) => {
    // Sort and get top 8 emotions for a richer display
    const topEmotions = Object.entries(emotions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .filter(([, score]) => score > 0.02);

    if (topEmotions.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 p-6 glass rounded-[3rem] border border-white/10 w-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-1 ring-white/10">
            <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Emotional Resonance</span>
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-calm shadow-[0_0_10px_var(--calm)] animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-alert shadow-[0_0_10px_var(--alert)] animate-pulse delay-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-stressed shadow-[0_0_10px_var(--stressed)] animate-pulse delay-150" />
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {topEmotions.map(([emotion, score]) => {
                    const isStress = ['Anxiety', 'Distress', 'Confusion', 'Fear', 'Sorrow'].includes(emotion);
                    const isCalm = ['Calmness', 'Contentment', 'Relief', 'Satisfaction'].includes(emotion);

                    const colorClass = isStress ? 'bg-stressed' : isCalm ? 'bg-calm' : 'bg-alert';
                    const glowClass = isStress ? 'shadow-[0_0_15px_rgba(225,29,72,0.4)]' : isCalm ? 'shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'shadow-[0_0_15px_rgba(245,158,11,0.4)]';

                    return (
                        <motion.div
                            key={emotion}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="space-y-1.5"
                        >
                            <div className="flex justify-between items-end px-1">
                                <span className="text-xs font-bold text-white/80 capitalize tracking-tight">{emotion}</span>
                                <span className="text-[10px] font-mono font-bold opacity-30 italic">{(score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score * 100}%` }}
                                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                    className={`h-full rounded-full transition-colors duration-500 ${colorClass} ${glowClass}`}
                                    style={{ opacity: 0.5 + (score * 0.5) }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
