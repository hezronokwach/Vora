import { useState, useRef, useEffect, useCallback } from 'react';
import { HumeClient } from 'hume';
import { useAuraStore, type Task } from '@/store/useAuraStore';

import {
    convertBlobToBase64,
    ensureSingleValidAudioTrack,
    getAudioStream,
    getBrowserSupportedMimeType,
    EVIWebAudioPlayer,
    MimeType
} from 'hume';

export type HumeStatus = 'IDLE' | 'CONNECTING' | 'ACTIVE' | 'ERROR';

export interface HumeMessage {
    role: 'user' | 'assistant';
    text: string;
    timestamp?: number;
}

export const useHume = () => {
    const { setStressScore, setVoiceState, tasks } = useAuraStore();
    const [status, setStatus] = useState<HumeStatus>('IDLE');
    const [messages, setMessages] = useState<HumeMessage[]>([]);
    const [liveTranscript, setLiveTranscript] = useState<string>('');
    const [isMicMuted, setIsMicMuted] = useState(true);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const isSpeakerMutedRef = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const [emotions, setEmotions] = useState<Record<string, number>>({});

    const socketRef = useRef<any>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const playerRef = useRef<EVIWebAudioPlayer | null>(null);
    const lastSyncedTasksRef = useRef<string>('');

    useEffect(() => {
        return () => {
            if (recorderRef.current) {
                recorderRef.current.stream.getTracks().forEach(t => t.stop());
            }
            if (playerRef.current) {
                playerRef.current.dispose();
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    /**
     * Weighted Emotional Index (WEI) - Scientific Stress Calculation
     * 
     * Formula: Stress_Total = (Distress × 0.5) + (Anxiety × 0.3) + (Overload × 0.2)
     * 
     * Components:
     * - Distress (50%): Primary burnout indicator (sadness, distress, frustration)
     * - Anxiety (30%): Secondary stress signal (anxiety, fear, nervousness)
     * - Overload (20%): Cognitive fatigue multiplier (tiredness, boredom, confusion)
     * 
     * See STRESS_METRICS.md for full scientific documentation
     */
    const calculateStress = (prosody: any) => {
        if (!prosody?.scores) return 0;

        console.group('🧠 Weighted Emotional Index Calculation');

        // Component 1: Distress (Primary Burnout Indicator)
        const distressEmotions = ['distress', 'sadness', 'frustration', 'disappointment'];
        const distressScore = Math.max(
            ...distressEmotions.map(e => prosody.scores[e] || prosody.scores[e.charAt(0).toUpperCase() + e.slice(1)] || 0)
        );

        // Component 2: Anxiety (Secondary Stress Signal)
        const anxietyEmotions = ['anxiety', 'fear', 'nervousness', 'worry'];
        const anxietyScore = Math.max(
            ...anxietyEmotions.map(e => prosody.scores[e] || prosody.scores[e.charAt(0).toUpperCase() + e.slice(1)] || 0)
        );

        // Component 3: Overload (Cognitive Fatigue)
        const overloadEmotions = ['tiredness', 'boredom', 'confusion'];
        const overloadScore = Math.max(
            ...overloadEmotions.map(e => prosody.scores[e] || prosody.scores[e.charAt(0).toUpperCase() + e.slice(1)] || 0)
        );

        // Apply Weighted Emotional Index formula
        const stressTotal = (distressScore * 0.5) + (anxietyScore * 0.3) + (overloadScore * 0.2);
        
        // Normalize to 0-100 scale
        const finalScore = Math.min(Math.round(stressTotal * 100), 100);

        console.log(`📊 Component Scores:`);
        console.log(`   Distress: ${(distressScore * 100).toFixed(1)}% (weight: 0.5)`);
        console.log(`   Anxiety: ${(anxietyScore * 100).toFixed(1)}% (weight: 0.3)`);
        console.log(`   Overload: ${(overloadScore * 100).toFixed(1)}% (weight: 0.2)`);
        console.log(`🎯 Final Stress Score: ${finalScore}/100`);
        console.groupEnd();

        return finalScore;
    };

    const startAudioCapture = useCallback(async (socket: any) => {
        try {
            const mimeTypeResult = getBrowserSupportedMimeType();
            const mimeType = mimeTypeResult.success ? mimeTypeResult.mimeType : MimeType.WEBM;

            const micAudioStream = await getAudioStream();
            ensureSingleValidAudioTrack(micAudioStream);

            const recorder = new MediaRecorder(micAudioStream, { mimeType });

            recorder.ondataavailable = async (e: BlobEvent) => {
                if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                    const data = await convertBlobToBase64(e.data);
                    socket.sendAudioInput({ data });
                }
            };

            recorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                setError('Microphone error');
            };

            recorder.start(80);
            recorderRef.current = recorder;
            setIsMicMuted(false);
            setVoiceState('listening');

            console.log('Audio capture started');
        } catch (err: any) {
            console.error('Failed to start audio capture:', err);
            setError(err.message);
        }
    }, [setVoiceState]);

    const stopAudioCapture = useCallback(() => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
            recorderRef.current.stream.getTracks().forEach(t => t.stop());
            recorderRef.current = null;
            setIsMicMuted(true);
            setVoiceState('idle');
            console.log('Audio capture stopped');
        }
    }, [setVoiceState]);

    const handleOpen = useCallback(async () => {
        console.log('Hume socket opened');
        setStatus('ACTIVE');

        const player = new EVIWebAudioPlayer();
        await player.init();
        playerRef.current = player;
    }, []);

    const handleMessage = useCallback(async (msg: any) => {
        console.log('Hume message:', msg.type);

        switch (msg.type) {
            case 'audio_output':
                if (playerRef.current && !isSpeakerMutedRef.current) {
                    await playerRef.current.enqueue(msg);
                }
                break;

            case 'user_message':
                if (msg.message?.content) {
                    if (msg.interim) {
                        setLiveTranscript(msg.message.content);
                    } else {
                        setLiveTranscript('');
                        setMessages(prev => [...prev, {
                            role: 'user',
                            text: msg.message.content,
                            timestamp: Date.now()
                        }]);

                        // Calculate Stress from User Message
                        if (msg.models?.prosody) {
                            const score = calculateStress(msg.models.prosody);
                            console.log('Calculated stress score:', score, 'from prosody:', msg.models.prosody);
                            setStressScore(score);
                            setEmotions(msg.models.prosody.scores || {});
                            
                            // Store dominant emotion for audit trail
                            const dominantEmotion = Object.entries(msg.models.prosody.scores || {})
                                .sort(([, a]: any, [, b]: any) => b - a)[0];
                            if (dominantEmotion) {
                                const [emotion, emotionScore] = dominantEmotion as [string, number];
                                useAuraStore.getState().setCurrentEmotion(
                                    `${emotion} (${(emotionScore * 100).toFixed(0)}%)`
                                );
                            }
                        }
                    }
                }
                break;

            case 'assistant_message':
                if (msg.message?.content) {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        text: msg.message.content,
                        timestamp: Date.now()
                    }]);
                    setVoiceState('speaking');
                }
                break;

            case 'assistant_end':
                setVoiceState('listening');
                break;

            case 'user_interruption':
                console.log('User interrupted');
                if (playerRef.current) {
                    playerRef.current.stop();
                }
                setVoiceState('listening');
                break;

            case 'tool_call':
                const toolName = msg.name;
                const toolCallId = msg.toolCallId || msg.tool_call_id;
                const toolParams = msg.parameters;

                console.warn('!!! HUME TOOL CALL RECEIVED !!!', toolName, toolParams);

                if (toolName === 'end_call' && toolCallId) {
                    console.warn('[AURA TOOL] END_CALL triggered by AI');
                    
                    // Send tool response first
                    if (socketRef.current?.sendToolResponseMessage) {
                        socketRef.current.sendToolResponseMessage({
                            type: 'tool_response',
                            toolCallId: toolCallId,
                            content: 'Ending session. Goodbye!'
                        });
                    } else if (socketRef.current?.sendToolResponse) {
                        socketRef.current.sendToolResponse({
                            type: 'tool_response',
                            tool_call_id: toolCallId,
                            content: 'Ending session. Goodbye!'
                        });
                    }
                    
                    // End session after brief delay
                    setTimeout(() => {
                        stopAudioCapture();
                        if (socketRef.current) {
                            socketRef.current.close();
                            socketRef.current = null;
                        }
                        setStatus('IDLE');
                        setMessages([]);
                    }, 1000);
                }

                if (toolName === 'manage_burnout' && toolCallId) {
                    let params: any = {};
                    try {
                        params = typeof toolParams === 'string'
                            ? JSON.parse(toolParams)
                            : toolParams;
                    } catch (e) {
                        console.error('Failed to parse tool parameters', e);
                    }

                    const taskId = params.task_id || params.taskId;
                    let adjustmentType = params.adjustment_type || params.adjustmentType || params.new_status || params.status || 'postpone';

                    const isComplete = ['complete', 'completed', 'finished', 'done', 'finish'].includes(adjustmentType.toLowerCase());
                    const isPostpone = ['postpone', 'postponed', 'later', 'move'].includes(adjustmentType.toLowerCase());
                    const isCancel = ['cancel', 'cancelled', 'drop', 'remove'].includes(adjustmentType.toLowerCase());

                    if (isComplete) adjustmentType = 'complete';
                    else if (isPostpone) adjustmentType = 'postpone';
                    else if (isCancel) adjustmentType = 'cancel';

                    console.warn(`[AURA TOOL] SETTING PENDING ACTION: task=${taskId}, action=${adjustmentType}`);

                    // Get task name for modal
                    const task = useAuraStore.getState().tasks.find(t => String(t.id) === String(taskId));
                    const taskName = task?.title || 'Unknown Task';

                    // Set pending action instead of immediate execution
                    useAuraStore.getState().setPendingAction({
                        taskId,
                        taskName,
                        actionType: adjustmentType as any,
                        timestamp: Date.now()
                    });

                    const result = { success: true, message: `Preparing to ${adjustmentType} "${taskName}"...` };
                    console.warn(`[AURA TOOL] RESULT:`, result.message);

                    if (socketRef.current?.sendToolResponseMessage) {
                        socketRef.current.sendToolResponseMessage({
                            type: 'tool_response',
                            toolCallId: toolCallId,
                            content: result.message
                        });
                    } else if (socketRef.current?.sendToolResponse) {
                        socketRef.current.sendToolResponse({
                            type: 'tool_response',
                            tool_call_id: toolCallId,
                            content: result.message
                        });
                    }
                }
                break;

            case 'error':
                console.error('Hume message error:', msg.message);
                setError(msg.message);
                break;

            default:
                console.log('DEBUG: Received message of type:', msg.type, msg);
                break;
        }
    }, [setStressScore, setVoiceState, stopAudioCapture]);

    // Update Hume context whenever tasks change
    useEffect(() => {
        if (socketRef.current && status === 'ACTIVE') {
            const taskContext = tasks.map((t: Task) =>
                `- [${t.id}] ${t.title} (${t.priority} priority, status: ${t.status}, due: ${t.day})`
            ).join('\n');

            // ONLY sync if the task state has actually changed to avoid socket spam/closure
            if (taskContext === lastSyncedTasksRef.current) return;
            lastSyncedTasksRef.current = taskContext;

            const baseInstructions = `
You are Aura, an empathic productivity assistant.
CORE RULES:
1. You MUST use 'manage_burnout' for ANY status change. Never just talk about it—do it!
2. ACTION MAPPING:
   - User says "Finished", "Done", "Fixed", or "Checked off" -> Use 'complete'.
   - User says "Later", "Tomorrow", or "Can't do it now" -> Use 'postpone'.
3. MANDATORY: The tool 'manage_burnout' is your ONLY way to change tasks. Even if the user sounds happy, use it to mark things as 'complete'.
4. Celebrate! When a user finishes a task, call the tool first, then tell them how proud you are.
5. Refer to tasks by their IDs (e.g., "Task 1").
`;

            const fullPrompt = `${baseInstructions}\n\nCURRENT TASKS:\n${taskContext}`;

            console.warn('--- AURA: Syncing Tasks to Hume ---');
            socketRef.current.sendSessionSettings({
                system_prompt: fullPrompt
            });
        }
    }, [tasks, status]);

    const handleError = useCallback((err: Event | Error) => {
        console.error('Hume socket error:', err);
        setError('Connection error');
        setStatus('ERROR');
    }, []);

    const handleClose = useCallback((e: any) => {
        console.log('Hume socket closed:', e);
        setStatus('IDLE');
        setVoiceState('idle');

        if (recorderRef.current) {
            recorderRef.current.stream.getTracks().forEach(t => t.stop());
            recorderRef.current = null;
        }
        if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
        }
    }, [setVoiceState]);

    const startSession = useCallback(async (options?: { configId?: string; voiceId?: string; language?: string }) => {
        try {
            if (socketRef.current) {
                console.log('Session already active');
                return;
            }

            setStatus('CONNECTING');
            setError(null);

            const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;
            if (!apiKey) {
                throw new Error('HUME_API_KEY not found in environment variables');
            }

            const client = new HumeClient({ apiKey });
            const configId = options?.configId || process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

            const connectOptions: any = {};
            if (configId) connectOptions.configId = configId;

            const sessionSettings: any = {};
            if (options?.voiceId) sessionSettings.voiceId = options.voiceId;

            if (Object.keys(sessionSettings).length > 0) {
                connectOptions.sessionSettings = sessionSettings;
            }

            const socket = await client.empathicVoice.chat.connect(connectOptions);
            socketRef.current = socket;

            socket.on('open', handleOpen);
            socket.on('message', handleMessage);
            socket.on('error', handleError);
            socket.on('close', handleClose);

        } catch (err: any) {
            console.error('Failed to start Hume session:', err);
            setError(err.message);
            setStatus('ERROR');
        }
    }, [handleOpen, handleMessage, handleError, handleClose]);

    const endSession = useCallback(async () => {
        stopAudioCapture();

        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        setStatus('IDLE');
        setMessages([]);
    }, [stopAudioCapture]);

    const updateSessionSettings = useCallback((settings: { voiceId?: string; systemPrompt?: string; context?: string }) => {
        if (socketRef.current) {
            socketRef.current.sendSessionSettings(settings);
            console.log('Session settings updated:', settings);
        }
    }, []);

    const toggleMic = useCallback(async () => {
        if (!socketRef.current) {
            console.log('No active session');
            return;
        }

        if (isMicMuted) {
            await startAudioCapture(socketRef.current);
        } else {
            stopAudioCapture();
        }
    }, [isMicMuted, startAudioCapture, stopAudioCapture]);

    const toggleSpeaker = useCallback(() => {
        const newValue = !isSpeakerMutedRef.current;
        isSpeakerMutedRef.current = newValue;
        setIsSpeakerMuted(newValue);
        if (playerRef.current && newValue) {
            playerRef.current.stop();
        }
    }, []);

    return {
        status,
        messages,
        liveTranscript,
        isMicMuted,
        isSpeakerMuted,
        error,
        startSession,
        endSession,
        toggleMic,
        toggleSpeaker,
        updateSessionSettings,
        emotions
    };
};
