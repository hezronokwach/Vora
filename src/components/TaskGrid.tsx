'use client';

import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAuraStore } from '@/store/useAuraStore';
import { Clock, Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { TaskCard } from './TaskCard';

export const TaskGrid = () => {
    const tasks = useAuraStore((state) => state.tasks);

    useEffect(() => {
        console.log('TaskGrid state update:', tasks);
        // Expose a global move command for the user to debug animations
        (window as any).auraMoveTask = (id: string) => {
            console.log(`Debug: Manually moving task ${id}`);
            useAuraStore.getState().manageBurnout(id, 'postpone');
        };
    }, [tasks]);

    const todayTasks = tasks.filter(t => t.day === 'today' && t.status === 'pending');
    const tomorrowTasks = tasks.filter(t => t.day === 'tomorrow' && (t.status === 'pending' || t.status === 'postponed'));

    return (
        <LayoutGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                <section className="flex flex-col">
                    <div className="flex items-center justify-between mb-6 relative">
                        <div className="absolute inset-0 bg-calm/5 blur-2xl rounded-full pointer-events-none" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-calm/10 ring-1 ring-calm/20">
                                <Clock className="w-5 h-5 text-calm" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Today's Focus</h2>
                                <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-0.5">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <span className="relative text-xs font-bold uppercase tracking-widest opacity-30">
                            {todayTasks.length} {todayTasks.length === 1 ? 'Task' : 'Tasks'}
                        </span>
                    </div>

                    <motion.div layout className="space-y-4 min-h-[100px]">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {todayTasks.length > 0 ? (
                                todayTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))
                            ) : (
                                <EmptyState key="today-empty" message="All clear for today. You're doing great!" />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </section>

                <section className="flex flex-col">
                    <div className="flex items-center justify-between mb-6 relative">
                        <div className="absolute inset-0 bg-slate-500/5 blur-2xl rounded-full pointer-events-none" />
                        <div className="relative flex items-center gap-3 opacity-60">
                            <div className="p-2 rounded-xl bg-slate-500/10 ring-1 ring-slate-500/20">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Upcoming</h2>
                        </div>
                        <span className="relative text-xs font-bold uppercase tracking-widest opacity-20">
                            {tomorrowTasks.length} {tomorrowTasks.length === 1 ? 'Task' : 'Tasks'}
                        </span>
                    </div>

                    <motion.div layout className="space-y-4 min-h-[100px]">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {tomorrowTasks.length > 0 ? (
                                tomorrowTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))
                            ) : (
                                <EmptyState key="tomorrow-empty" message="No upcoming tasks. Rest up." />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </section>
            </div>
        </LayoutGroup>
    );
};

const EmptyState = ({ message }: { message: string }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] text-center relative overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-calm/5 to-transparent opacity-50" />
        <p className="relative text-sm font-medium opacity-20 italic px-8">{message}</p>
    </motion.div>
);
