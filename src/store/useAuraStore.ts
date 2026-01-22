import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ActionLog } from '@/types';

export interface Task {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    day: 'today' | 'tomorrow';
    status: 'pending' | 'completed' | 'postponed' | 'cancelled' | 'delegated';
}

interface AuraState {
    stressScore: number;
    tasks: Task[];
    voiceState: 'idle' | 'listening' | 'speaking' | 'processing';
    sessionHistory: { time: string; score: number }[];
    feedbackMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
    actionLogs: ActionLog[];
    currentEmotion: string;
    pendingAction: {
        taskId: string;
        taskName: string;
        actionType: 'postpone' | 'cancel' | 'delegate' | 'complete';
        timestamp: number;
    } | null;

    // Actions
    setStressScore: (score: number) => void;
    setVoiceState: (state: AuraState['voiceState']) => void;
    postponeTask: (id: string) => void;
    completeTask: (id: string) => void;
    manageBurnout: (taskId?: string, adjustmentType?: 'postpone' | 'cancel' | 'delegate' | 'complete') => { success: boolean; message: string };
    addTask: (task: Task) => void;
    addSessionData: (data: { time: string; score: number }) => void;
    resetSession: () => void;
    setFeedbackMessage: (message: { text: string; type: 'success' | 'info' | 'warning' } | null) => void;
    addActionLog: (log: Omit<ActionLog, 'id'>) => void;
    setCurrentEmotion: (emotion: string) => void;
    setPendingAction: (action: AuraState['pendingAction']) => void;
    clearPendingAction: () => void;
    executePendingAction: () => void;
}

export const useAuraStore = create<AuraState>()(
    devtools(
        persist(
            (set) => ({
                stressScore: 0,
                voiceState: 'idle',
                tasks: [
                    { id: '1', title: 'Chemistry Lab Report', priority: 'high', day: 'today', status: 'pending' },
                    { id: '2', title: 'Calculus Assignment', priority: 'medium', day: 'today', status: 'pending' },
                    { id: '3', title: 'English Literature Essay', priority: 'low', day: 'today', status: 'pending' },
                ],
                sessionHistory: [],
                feedbackMessage: null,
                actionLogs: [],
                currentEmotion: 'Neutral',
                pendingAction: null,

                setStressScore: (score) => set((state) => ({
                    stressScore: score,
                    sessionHistory: [...state.sessionHistory, { time: new Date().toLocaleTimeString(), score }].slice(-20)
                })),

                setVoiceState: (voiceState) => set({ voiceState }),

                postponeTask: (id) => set((state) => {
                    console.warn(`[STORE] Postponing Task: ${id}`);
                    const task = state.tasks.find(t => String(t.id) === String(id));
                    
                    // Show feedback message
                    if (task) {
                        setTimeout(() => {
                            useAuraStore.getState().setFeedbackMessage({
                                text: `"${task.title}" moved to tomorrow`,
                                type: 'info'
                            });
                            setTimeout(() => useAuraStore.getState().setFeedbackMessage(null), 3000);
                        }, 100);
                    }
                    
                    return {
                        tasks: state.tasks.map((t) =>
                            String(t.id) === String(id) ? { ...t, day: 'tomorrow' as const, status: 'postponed' as const } : t
                        ),
                    };
                }),

                completeTask: (id) => set((state) => {
                    console.warn(`[STORE] Completing Task: ${id}`);
                    const task = state.tasks.find(t => String(t.id) === String(id));
                    
                    // Show feedback message
                    if (task) {
                        setTimeout(() => {
                            useAuraStore.getState().setFeedbackMessage({
                                text: `"${task.title}" completed! Great work!`,
                                type: 'success'
                            });
                            setTimeout(() => useAuraStore.getState().setFeedbackMessage(null), 3000);
                        }, 100);
                    }
                    
                    return {
                        tasks: state.tasks.map((t) =>
                            String(t.id) === String(id) ? { ...t, status: 'completed' as const } : t
                        ),
                    };
                }),

                manageBurnout: (taskId, adjustmentType = 'postpone') => {
                    let message = "";
                    let success = false;

                    set((state) => {
                        const taskIndex = state.tasks.findIndex(t => String(t.id) === String(taskId));

                        if (taskIndex === -1) {
                            message = `Task with ID ${taskId} not found. Available IDs: ${state.tasks.map(t => t.id).join(', ')}`;
                            return state;
                        }

                        const task = state.tasks[taskIndex];
                        const updatedTasks = [...state.tasks];

                        if (adjustmentType === 'postpone') {
                            updatedTasks[taskIndex] = { ...task, day: 'tomorrow', status: 'postponed' };
                            message = `Postponed "${task.title}" to tomorrow.`;
                            setTimeout(() => {
                                useAuraStore.getState().setFeedbackMessage({
                                    text: `"${task.title}" moved to tomorrow`,
                                    type: 'info'
                                });
                                setTimeout(() => useAuraStore.getState().setFeedbackMessage(null), 3000);
                            }, 100);
                            // Log action
                            useAuraStore.getState().addActionLog({
                                timestamp: Date.now(),
                                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                triggerEmotion: state.currentEmotion,
                                action: `Postponed "${task.title}"`,
                                outcome: 'success',
                                stressScore: state.stressScore
                            });
                        } else if (adjustmentType === 'cancel') {
                            updatedTasks[taskIndex] = { ...task, status: 'cancelled' };
                            message = `Cancelled "${task.title}".`;
                            setTimeout(() => {
                                useAuraStore.getState().setFeedbackMessage({
                                    text: `"${task.title}" cancelled`,
                                    type: 'warning'
                                });
                                setTimeout(() => useAuraStore.getState().setFeedbackMessage(null), 3000);
                            }, 100);
                            useAuraStore.getState().addActionLog({
                                timestamp: Date.now(),
                                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                triggerEmotion: state.currentEmotion,
                                action: `Cancelled "${task.title}"`,
                                outcome: 'success',
                                stressScore: state.stressScore
                            });
                        } else if (adjustmentType === 'delegate') {
                            updatedTasks[taskIndex] = { ...task, status: 'delegated' };
                            message = `Marked "${task.title}" for delegation.`;
                            setTimeout(() => {
                                useAuraStore.getState().setFeedbackMessage({
                                    text: `"${task.title}" delegated`,
                                    type: 'info'
                                });
                                setTimeout(() => useAuraStore.getState().setFeedbackMessage(null), 3000);
                            }, 100);
                            useAuraStore.getState().addActionLog({
                                timestamp: Date.now(),
                                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                triggerEmotion: state.currentEmotion,
                                action: `Delegated "${task.title}"`,
                                outcome: 'success',
                                stressScore: state.stressScore
                            });
                        } else if (adjustmentType === 'complete') {
                            updatedTasks[taskIndex] = { ...task, status: 'completed' };
                            message = `Awesome! I've marked "${task.title}" as completed.`;
                            setTimeout(() => {
                                useAuraStore.getState().setFeedbackMessage({
                                    text: `"${task.title}" completed! Great work!`,
                                    type: 'success'
                                });
                                setTimeout(() => useAuraStore.getState().setFeedbackMessage(null), 3000);
                            }, 100);
                            useAuraStore.getState().addActionLog({
                                timestamp: Date.now(),
                                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                triggerEmotion: state.currentEmotion,
                                action: `Completed "${task.title}"`,
                                outcome: 'success',
                                stressScore: state.stressScore
                            });
                        }

                        success = true;
                        console.warn(`[STORE] manageBurnout Applied: ${message}`);
                        return { tasks: updatedTasks };
                    });

                    return { success, message };
                },

                addTask: (task) => set((state) => ({
                    tasks: [...state.tasks, task],
                })),

                addSessionData: (data) => set((state) => ({
                    sessionHistory: [...state.sessionHistory, data].slice(-20),
                })),

                resetSession: () => set({ stressScore: 0, sessionHistory: [] }),

                setFeedbackMessage: (message) => set({ feedbackMessage: message }),

                addActionLog: (log) => set((state) => ({
                    actionLogs: [
                        { ...log, id: Date.now().toString() },
                        ...state.actionLogs
                    ].slice(0, 50)
                })),

                setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),

                setPendingAction: (action) => set({ pendingAction: action }),

                clearPendingAction: () => set({ pendingAction: null }),

                executePendingAction: () => {
                    const { pendingAction } = useAuraStore.getState();
                    if (pendingAction) {
                        useAuraStore.getState().manageBurnout(pendingAction.taskId, pendingAction.actionType);
                        useAuraStore.getState().clearPendingAction();
                    }
                },
            }),
            {
                name: 'aura-ai-storage', // unique name for localStorage
            }
        )
    )
);
