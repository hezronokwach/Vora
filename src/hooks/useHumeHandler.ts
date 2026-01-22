import { useState, useRef, useEffect, useCallback } from 'react';
import { HumeClient } from 'hume';
import { useMarketStore } from '@/store/useMarketStore';

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
    const { setEmotionData, products } = useMarketStore();
    const [status, setStatus] = useState<HumeStatus>('IDLE');
    const [messages, setMessages] = useState<HumeMessage[]>([]);
    const [liveTranscript, setLiveTranscript] = useState<string>('');
    const [isMicMuted, setIsMicMuted] = useState(true);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const isSpeakerMutedRef = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const [emotions, setEmotions] = useState<Record<string, number>>({});
    const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');

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
     * Calculate emotion-based discount multiplier
     * Higher stress/frustration = higher discount
     */
    const calculateEmotionDiscount = (prosody: any) => {
        if (!prosody?.scores) return 0;

        const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
        const maxStress = Math.max(
            ...stressEmotions.map(e => prosody.scores[e] || 0)
        );

        // Convert to discount percentage (0-25%)
        return Math.min(Math.round(maxStress * 25), 25);
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

                        // Calculate emotion discount from User Message
                        if (msg.models?.prosody) {
                            const discount = calculateEmotionDiscount(msg.models.prosody);
                            console.log('Calculated emotion discount:', discount, '%');
                            setEmotionData(msg.models.prosody.scores || {});
                            setEmotions(msg.models.prosody.scores || {});
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

                console.log('VORA TOOL CALL:', toolName, toolParams);

                switch (toolName) {
                    case 'filter_products':
                        useMarketStore.getState().setFilters({
                            category: toolParams.category,
                            color: toolParams.color,
                            maxPrice: toolParams.max_price
                        });
                        
                        if (socketRef.current?.sendToolResponse) {
                            socketRef.current.sendToolResponse({
                                toolCallId,
                                content: `Filtered products by ${JSON.stringify(toolParams)}`
                            });
                        }
                        break;

                    case 'add_to_cart':
                        const product = useMarketStore.getState().products
                            .find(p => p._id === toolParams.product_id);
                        if (product) {
                            useMarketStore.getState().addToCart(product, toolParams.quantity || 1);
                            
                            if (socketRef.current?.sendToolResponse) {
                                socketRef.current.sendToolResponse({
                                    toolCallId,
                                    content: `Added ${product.title} to cart`
                                });
                            }
                        }
                        break;

                    case 'trigger_checkout':
                        useMarketStore.getState().openCheckout();
                        
                        if (socketRef.current?.sendToolResponse) {
                            socketRef.current.sendToolResponse({
                                toolCallId,
                                content: 'Opening checkout'
                            });
                        }
                        break;

                    case 'apply_discount':
                        // Implement discount logic here
                        if (socketRef.current?.sendToolResponse) {
                            socketRef.current.sendToolResponse({
                                toolCallId,
                                content: `Applied discount: ${toolParams.reasoning}`
                            });
                        }
                        break;
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
    }, [setEmotionData, stopAudioCapture]);

    // Update Hume context with product information
    useEffect(() => {
        if (socketRef.current && status === 'ACTIVE') {
            const productContext = products.slice(0, 5).map(p => 
                `- ${p.title} ($${p.price}) - ${p.category}`
            ).join('\n');

            const baseInstructions = `
You are Vora, an empathic shopping assistant.
CORE RULES:
1. Help users find products through voice commands
2. Use filter_products to filter by category, color, or price
3. Use add_to_cart to add products to cart
4. Use trigger_checkout to open checkout
5. Offer empathetic discounts when users sound stressed
6. Be conversational and helpful, not pushy
`;

            const fullPrompt = `${baseInstructions}\n\nAVAILABLE PRODUCTS:\n${productContext}`;

            console.log('Syncing products to Hume');
            socketRef.current.sendSessionSettings({
                system_prompt: fullPrompt
            });
        }
    }, [products, status]);

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
        emotions,
        voiceState
    };
};
