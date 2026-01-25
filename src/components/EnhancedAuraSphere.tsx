'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '@/store/useAuraStore';
import { useMemo } from 'react';

export const EnhancedAuraSphere = () => {
    const stressScore = useAuraStore((state) => state.stressScore);
    const voiceState = useAuraStore((state) => state.voiceState);

    // Map stress score to visual configurations
    const config = useMemo(() => {
        if (stressScore < 30) {
            return {
                baseColor: '#14b8a6',
                glowColor: 'rgba(20, 184, 166, 0.4)',
                secondaryColor: 'rgba(45, 212, 191, 0.3)',
                speed: 4,
                scale: 1,
            };
        } else if (stressScore < 70) {
            return {
                baseColor: '#f59e0b',
                glowColor: 'rgba(245, 158, 11, 0.4)',
                secondaryColor: 'rgba(251, 191, 36, 0.3)',
                speed: 2,
                scale: 1.15,
            };
        } else {
            return {
                baseColor: '#e11d48',
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
            scale: config.scale * 1.05,  // Reduced: 1.1 -> 1.05
            rotate: [0, 3, -3, 0],  // Reduced: 5 -> 3 degrees
            transition: {
                duration: 2,  // Slower: 1.5 -> 2 seconds
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        speaking: {
            scale: [config.scale, config.scale * 1.05, config.scale],  // Reduced: 1.2 -> 1.05
            transition: {
                duration: 1,  // Slower: 0.5 -> 1 second
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
        <div className="relative flex items-center justify-center w-48 h-48">
            {/* Orbiting emotional indicators */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                {[0, 120, 240].map((angle, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            backgroundColor: config.baseColor,
                            left: '50%',
                            top: '50%',
                            transform: `rotate(${angle}deg) translateX(75px) translateY(-50%)`,
                            boxShadow: `0 0 15px ${config.glowColor}`,
                        }}
                        animate={{
                            scale: voiceState === 'listening' ? [1, 1.5, 1] : 1,
                        }}
                        transition={{
                            duration: 3,  // Slower: 2 -> 3 seconds
                            repeat: Infinity,
                            delay: i * 0.5,  // More staggered
                        }}
                    />
                ))}
            </motion.div>

            <motion.div
                variants={auraVariants}
                animate={voiceState}
                className="relative w-full h-full flex items-center justify-center"
            >
                {/* Secondary Outer Layer */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: config.speed * 3,  // Slower: speed * 2 -> speed * 3
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute w-42 h-42 rounded-full opacity-30"
                    style={{ background: `linear-gradient(45deg, ${config.baseColor}, ${config.secondaryColor})` }}
                />

                {/* Middle Pulse Layer */}
                <motion.div
                    animate={{
                        scale: [1.1, 0.9, 1.1],
                    }}
                    transition={{
                        duration: config.speed * 1.5,  // Slower: speed -> speed * 1.5
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute w-30 h-30 rounded-full opacity-40 blur-xl"
                    style={{ backgroundColor: config.baseColor }}
                />

                {/* Core Sphere */}
                <div className="relative w-24 h-24 rounded-full glass border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <motion.div
                        className="absolute inset-0 opacity-20"
                        animate={{
                            background: [
                                `radial-gradient(circle at 20% 20%, ${config.baseColor} 0%, transparent 50%)`,
                                `radial-gradient(circle at 80% 80%, ${config.baseColor} 0%, transparent 50%)`,
                                `radial-gradient(circle at 20% 20%, ${config.baseColor} 0%, transparent 50%)`
                            ]
                        }}
                        transition={{ duration: config.speed * 4, repeat: Infinity }}  // Slower: speed * 3 -> speed * 4
                    />

                    <AnimatePresence mode="wait">
                        <motion.span
                            key={voiceState}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 0.5, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[10px] font-bold uppercase tracking-[0.3em] z-10"
                        >
                            {voiceState === 'idle' ? 'Vora' : voiceState}
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
