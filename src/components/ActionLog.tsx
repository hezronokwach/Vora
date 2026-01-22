'use client';

import { useAuraStore } from '@/store/useAuraStore';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export const ActionLog = () => {
    const actionLogs = useAuraStore((state) => state.actionLogs);
    const [isExpanded, setIsExpanded] = useState(false);

    const displayLogs = isExpanded ? actionLogs : actionLogs.slice(0, 3);

    return (
        <div className="glass-card p-4 rounded-[2rem] border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-calm" />
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">Action Log</h3>
                </div>
                <span className="text-xs opacity-30">{actionLogs.length} events</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                <AnimatePresence mode="popLayout">
                    {displayLogs.length > 0 ? (
                        displayLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`p-3 rounded-xl border ${
                                    log.outcome === 'success'
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : log.outcome === 'cancelled'
                                        ? 'bg-amber-500/5 border-amber-500/20'
                                        : 'bg-red-500/5 border-red-500/20'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{log.action}</p>
                                        <p className="text-[10px] opacity-40 mt-1">
                                            {log.triggerEmotion} • Stress: {log.stressScore}/100
                                        </p>
                                    </div>
                                    <span className="text-[10px] opacity-30 whitespace-nowrap">{log.time}</span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-8 text-center text-xs opacity-20 italic"
                        >
                            No actions logged yet
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {actionLogs.length > 3 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full mt-3 py-2 text-xs font-medium opacity-40 hover:opacity-60 transition-opacity flex items-center justify-center gap-1"
                >
                    {isExpanded ? (
                        <>
                            Show Less <ChevronUp className="w-3 h-3" />
                        </>
                    ) : (
                        <>
                            Show All ({actionLogs.length}) <ChevronDown className="w-3 h-3" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
};
