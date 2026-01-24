'use client';

import { useHume } from '@/hooks/useHumeHandler';
import { Mic, MicOff, PhoneOff, Play, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedAuraSphere } from './EnhancedAuraSphere';

export const VoiceController = () => {
    const {
        status,
        isMicMuted,
        error,
        startSession,
        endSession,
        toggleMic,
        emotions
    } = useHume();

    const isActive = status === 'ACTIVE';
    const isConnecting = status === 'CONNECTING';

    return (
        <div className="w-full flex flex-col items-center gap-6 transition-all duration-500" data-testid="voice-controller">
            {/* Emotion Sphere */}
            <div className="relative flex flex-col items-center justify-center py-4">
                <EnhancedAuraSphere />
                <div className="absolute bottom-0 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-30">
                        Vora Intelligence
                    </div>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-stressed/10 border border-stressed/20 px-4 py-2 rounded-full text-stressed text-xs flex items-center gap-2 shadow-lg backdrop-blur-md"
                >
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </motion.div>
            )}

            <div className="w-full flex items-center gap-3 glass-card p-3 rounded-full">
                {!isActive ? (
                    <button
                        onClick={() => startSession()}
                        disabled={isConnecting}
                        className={`flex items-center justify-center gap-4 w-full py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-500 ${
                            isConnecting
                                ? 'bg-white/5 text-white/20'
                                : 'bg-calm text-white hover:bg-calm/90 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {isConnecting ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Play className="w-3 h-3 fill-current" />
                        )}
                        {isConnecting ? 'Connecting to Vora' : 'Start Voice Session'}
                    </button>
                ) : (
                    <div className="flex items-center justify-between w-full px-2">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleMic}
                                className={`p-3 rounded-full transition-all duration-300 ${
                                    isMicMuted
                                        ? 'bg-stressed text-white hover:bg-stressed/90'
                                        : 'bg-calm text-white hover:bg-calm/90'
                                }`}
                            >
                                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                            <span className="text-xs font-semibold text-white/60">
                                {isMicMuted ? 'Muted' : 'Listening'}
                            </span>
                        </div>

                        <button
                            onClick={endSession}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300"
                        >
                            <span className="text-xs font-semibold">End</span>
                            <PhoneOff className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
