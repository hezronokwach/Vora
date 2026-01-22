'use client';

import { useAuraStore } from '@/store/useAuraStore';
import { StressChart } from './StressChart';
import { motion } from 'framer-motion';
import { CheckCircle2, ListTodo, MoreHorizontal, Zap } from 'lucide-react';

export const AnalyticsDashboard = () => {
    const tasks = useAuraStore((state) => state.tasks);

    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const pendingCount = tasks.filter(t => t.day === 'today' && t.status === 'pending').length;
    const postponedCount = tasks.filter(t => t.status === 'postponed').length;

    const stats = [
        { label: 'Completed', value: completedCount, icon: <CheckCircle2 className="w-4 h-4 text-calm" />, color: 'bg-calm/10' },
        { label: 'Pending', value: pendingCount, icon: <ListTodo className="w-4 h-4 text-alert" />, color: 'bg-alert/10' },
        { label: 'Postponed', value: postponedCount, icon: <MoreHorizontal className="w-4 h-4 text-stressed" />, color: 'bg-stressed/10' },
    ];

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-calm/10">
                        <Zap className="w-5 h-5 text-calm" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Focus & Flux</h2>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <button
                        onClick={() => useAuraStore.getState().manageBurnout('2', 'postpone')}
                        className="text-[10px] font-bold uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity px-3 py-1 border border-white/10 rounded-full"
                    >
                        Debug Move Task
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Section */}
                <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 h-fit self-start">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="py-4 px-6 rounded-[1.5rem] glass border border-white/10 flex items-center justify-between hover:border-white/20 transition-colors shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest opacity-40">{stat.label}</span>
                            </div>
                            <span className="text-xl font-black tracking-tight">{stat.value}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Chart Section */}
                <div className="lg:col-span-2 min-h-[400px] relative">
                    <StressChart />
                </div>
            </div>
        </div>
    );
};
