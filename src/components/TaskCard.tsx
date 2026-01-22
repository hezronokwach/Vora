'use client';

import { motion } from 'framer-motion';
import { useAuraStore, Task } from '@/store/useAuraStore';
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react';

export const TaskCard = ({ task }: { task: Task }) => {
    const postponeTask = useAuraStore((state) => state.postponeTask);
    const completeTask = useAuraStore((state) => state.completeTask);

    const priorityColors = {
        high: 'bg-stressed',
        medium: 'bg-alert',
        low: 'bg-calm'
    };

    const statusConfig = {
        postponed: { label: 'Auto-Moved', color: 'bg-alert/10 text-alert border-alert/20', icon: <AlertCircle className="w-3 h-3" /> },
        cancelled: { label: 'Cancelled', color: 'bg-stressed/10 text-stressed border-stressed/20', icon: <Circle className="w-3 h-3 fill-current" /> },
        delegated: { label: 'Delegated', color: 'bg-calm/10 text-calm border-calm/20', icon: <CheckCircle2 className="w-3 h-3" /> },
    };

    const config = (task.status !== 'pending' && task.status !== 'completed')
        ? statusConfig[task.status as keyof typeof statusConfig]
        : null;

    return (
        <motion.div
            layout                    // PRESERVE - CRITICAL
            layoutId={task.id}        // PRESERVE - CRITICAL FOR CROSS-COLUMN ANIMATION
            initial={{ opacity: 0, x: -20 }}  // PRESERVE
            animate={{ opacity: 1, x: 0 }}    // PRESERVE
            exit={{ opacity: 0, x: 20, scale: 0.95 }}  // PRESERVE
            transition={{             // PRESERVE - EXACT TIMINGS
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1],
                layout: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
            }}
            className="relative group"
        >
            {/* NEW: Spotlight effect on hover - INSIDE motion.div */}
            <div className="absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-calm/10 via-transparent to-calm/10 blur-xl" />
            </div>

            {/* NEW: Glow effect on hover */}
            <div className="absolute -inset-[1px] rounded-[1.25rem] bg-gradient-to-r from-calm/20 to-alert/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />

            {/* PRESERVE: Original card content - EXACT SAME STRUCTURE */}
            <div className={`relative p-3.5 rounded-[1.25rem] glass flex justify-between items-center border border-white/10 hover:border-white/20 transition-colors shadow-sm cursor-default ${
                task.status === 'cancelled' ? 'opacity-40 grayscale' : ''
            }`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            postponeTask(task.id);
                        }}
                        disabled={task.day === 'tomorrow'}
                        className={`p-1 transition-opacity ${
                            task.day === 'today' 
                                ? 'opacity-20 hover:opacity-100 hover:scale-110 active:scale-95' 
                                : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <Circle className="w-5 h-5" />
                    </button>
                    <div>
                        <h3 className={`font-semibold text-base tracking-tight group-hover:text-calm transition-colors leading-tight ${
                            task.status === 'cancelled' ? 'line-through' : ''
                        }`}>
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                {task.priority} Priority
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {config && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${config.color}`}>
                            {config.icon}
                            <span className="text-[9px] font-black uppercase">{config.label}</span>
                        </div>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.warn(`Manual Complete Clicked: ${task.id}`);
                            completeTask(task.id);
                        }}
                        className="p-2 opacity-0 group-hover:opacity-40 hover:opacity-100 hover:text-calm transition-all"
                        title="Complete Task"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
