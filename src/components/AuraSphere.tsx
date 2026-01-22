'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '@/store/useAuraStore';
import { useMemo } from 'react';

export const AuraSphere = () => {
    const stressScore = useAuraStore((state) => state.stressScore);
    const voiceState = useAuraStore((state) => state.voiceState);

    // Map stress score to visual configurations
    const config = useMemo(() => {
        if (stressScore < 30) {
            return {
                baseColor: 'var(--calm)',
                glowColor: 'rgba(20, 184, 166, 0.4)',
                secondaryColor: 'rgba(45, 212, 191, 0.3)',
                speed: 4,
                scale: 1,
            };
        } else if (stressScore < 70) {
            return {
                baseColor: 'var(--alert)',
                glowColor: 'rgba(245, 158, 11, 0.4)',
                secondaryColor: 'rgba(251, 191, 36, 0.3)',
                speed: 2,
                scale: 1.15,
            };
        } else {
            return {
                baseColor: 'var(--stressed)',
                glowColor: 'rgba(225, 29, 72, 0.4)',
                secondaryColor: 'rgba(244, 63, 94, 0.3)',
                speed: 0.8,
                scale: 1.3,
            };
        }
    }, [stressScore]);

    // Voice state specific animations
    const auraVariants: any = {
        idle: {
            scale: config.scale,
            rotate: 0,
            transition: { duration: 2, ease: "easeInOut" }
        },
        listening: {
            scale: config.scale * 1.1,
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        speaking: {
            scale: [config.scale, config.scale * 1.2, config.scale],
            transition: {
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        processing: {
            scale: config.scale,
            rotate: 360,
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* SVG Filter for Fluidity */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="fluid">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="fluid" />
                </filter>
            </svg>

            <motion.div
                variants={auraVariants}
                animate={voiceState}
                className="relative w-full h-full flex items-center justify-center"
                style={{ filter: 'url(#fluid)' }}
            >
                {/* Secondary Outer Layer */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: config.speed * 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute w-56 h-56 rounded-full opacity-30"
                    style={{ background: `linear-gradient(45deg, ${config.baseColor}, ${config.secondaryColor})` }}
                />

                {/* Middle Pulse Layer */}
                <motion.div
                    animate={{
                        scale: [1.1, 0.9, 1.1],
                    }}
                    transition={{
                        duration: config.speed,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute w-40 h-40 rounded-full opacity-40 blur-xl"
                    style={{ backgroundColor: config.baseColor }}
                />

                {/* Core Sphere */}
                <div className="relative w-32 h-32 rounded-full glass border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden">
                    <motion.div
                        className="absolute inset-0 opacity-20"
                        animate={{
                            background: [
                                `radial-gradient(circle at 20% 20%, ${config.baseColor} 0%, transparent 50%)`,
                                `radial-gradient(circle at 80% 80%, ${config.baseColor} 0%, transparent 50%)`,
                                `radial-gradient(circle at 20% 20%, ${config.baseColor} 0%, transparent 50%)`
                            ]
                        }}
                        transition={{ duration: config.speed * 3, repeat: Infinity }}
                    />

                    <AnimatePresence mode="wait">
                        <motion.span
                            key={voiceState}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 0.5, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[10px] font-bold uppercase tracking-[0.3em] z-10"
                        >
                            {voiceState === 'idle' ? 'Aura' : voiceState}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Static Outer Shadow for Depth */}
            <div
                className="absolute inset-0 rounded-full blur-[100px] -z-10 transition-colors duration-1000"
                style={{ backgroundColor: config.glowColor }}
            />
        </div>
    );
};
