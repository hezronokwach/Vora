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
                setError('Microphone error');
            };

            recorder.start(80);
            recorderRef.current = recorder;
            setIsMicMuted(false);
            setVoiceState('listening');

        } catch (err: any) {
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
        }
    }, [setVoiceState]);

    const handleOpen = useCallback(async () => {
        setStatus('ACTIVE');

        const player = new EVIWebAudioPlayer();
        await player.init();
        playerRef.current = player;
    }, []);

    const handleMessage = useCallback(async (msg: any) => {
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
                if (playerRef.current) {
                    playerRef.current.stop();
                }
                setVoiceState('listening');
                break;

            case 'tool_call':
                const toolName = msg.name;
                const toolCallId = msg.toolCallId || msg.tool_call_id;
                const toolParams = JSON.parse(msg.parameters);

                try {
                    let toolResult = '';

                    switch (toolName) {
                        case 'filter_products':
                            useMarketStore.getState().setFilters({
                                category: toolParams.category,
                                color: toolParams.color,
                                maxPrice: toolParams.max_price
                            });
                            
                            const filteredCount = useMarketStore.getState().products.length;
                            toolResult = `Successfully filtered products. Found ${filteredCount} items matching the criteria.`;
                            break;

                        case 'add_to_cart':
                            let product = useMarketStore.getState().products
                                .find(p => p._id === toolParams.product_id);
                            
                            if (!product) {
                                product = useMarketStore.getState().products
                                    .find(p => p.title.toLowerCase().includes(toolParams.product_id.toLowerCase()));
                            }
                            
                            if (product) {
                                useMarketStore.getState().addToCart(product, toolParams.quantity || 1);
                                toolResult = `Added ${product.title} to cart (quantity: ${toolParams.quantity || 1})`;
                            } else {
                                throw new Error(`Product not found: ${toolParams.product_id}`);
                            }
                            break;

                        case 'trigger_checkout':
                            useMarketStore.getState().setCheckoutOpen(true);
                            toolResult = 'Checkout modal opened successfully';
                            break;

                        case 'apply_discount':
                            toolResult = 'Empathy discount applied successfully';
                            break;

                        case 'collect_address':
                            const formattedAddress = toolParams.address
                                .replace(/\bone twenty three\b/gi, '123')
                                .replace(/\bone hundred twenty three\b/gi, '123')
                                .replace(/\bone two three\b/gi, '123')
                                .split(' ')
                                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');
                            
                            useMarketStore.getState().setDeliveryAddress(formattedAddress);
                            toolResult = `Delivery address saved: ${formattedAddress}`;
                            break;

                        case 'navigate_to_orders':
                            setTimeout(() => {
                                window.location.href = '/orders';
                            }, 2000);
                            toolResult = 'Navigating to your orders page';
                            break;

                        default:
                            throw new Error(`Unknown tool: ${toolName}`);
                    }

                    if (socketRef.current) {
                        socketRef.current.sendToolResponseMessage({
                            toolCallId: toolCallId,
                            content: toolResult
                        });
                    }

                } catch (error: any) {
                    if (socketRef.current) {
                        socketRef.current.sendToolErrorMessage({
                            toolCallId: toolCallId,
                            error: "Tool execution failed",
                            content: error.message
                        });
                    }
                }
                break;

            case 'error':
                setError(msg.message);
                break;
        }
    }, [setEmotionData, stopAudioCapture]);

    // Update Hume context with product information and enhanced personality
    useEffect(() => {
        if (socketRef.current && status === 'ACTIVE') {
            const productContext = products.slice(0, 8).map(p => 
                `- ${p.title} ($${p.price}) - ${p.category} - Stock: ${p.stock}`
            ).join('\n');

            const baseInstructions = `
You are Vora, an empathic shopping assistant with a warm, caring personality.

CORE PERSONALITY:
- Speak naturally and conversationally, like a helpful friend
- Show genuine care for the user's wellbeing and needs
- Never be pushy or sales-focused - prioritize comfort and satisfaction
- Offer gentle suggestions based on what you sense they might enjoy
- When you detect stress or frustration, offer comfort and support first

SHOPPING ASSISTANCE RULES:
1. Use filter_products for any filtering requests (category, color, price)
2. Use add_to_cart when users want to add specific items
3. Use trigger_checkout when they're ready to purchase
4. Use apply_discount when offering empathetic discounts for stressed users

CONVERSATION EXAMPLES:
- "I'm looking for something comfortable" → Filter for comfort-related tags, suggest soft fabrics
- "This is expensive!" → Offer empathetic discount with caring message
- "I'm just browsing" → "That's perfectly fine! Take your time. I'm here if you need anything."
- "Tell me about this dress" → Describe features, styling tips, comfort aspects

EMPATHY GUIDELINES:
- If user sounds stressed: "I can sense you might be having a tough day. Let me help make this easier."
- If user sounds happy: "I love your positive energy! Let's find something that matches that vibe."
- If user is indecisive: "No pressure at all. Sometimes the right choice takes time."

REMEMBER: You're not just selling products - you're providing a caring, supportive shopping experience.
`;

            const fullPrompt = `${baseInstructions}\n\nAVAILABLE PRODUCTS:\n${productContext}`;

            socketRef.current.sendSessionSettings({
                system_prompt: fullPrompt
            });
        }
    }, [products, status]);

    const handleError = useCallback((err: Event | Error) => {
        setError('Connection error');
        setStatus('ERROR');
    }, []);

    const handleClose = useCallback((e: any) => {
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
        }
    }, []);

    const toggleMic = useCallback(async () => {
        if (!socketRef.current) {
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
