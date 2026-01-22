'use client';

import { useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuraStore } from '@/store/useAuraStore';

export const useFirebaseSync = () => {
    const stressScore = useAuraStore((state) => state.stressScore);
    const tasks = useAuraStore((state) => state.tasks);
    const voiceState = useAuraStore((state) => state.voiceState);
    const lastSaveRef = useRef<number>(0);

    useEffect(() => {
        // Only save if significant time has passed (e.g., 5 seconds) and voice is active or score changed
        const now = Date.now();
        if (now - lastSaveRef.current < 5000) return;

        const saveSession = async () => {
            try {
                // Only sync if Firebase is actually configured
                if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return;

                await addDoc(collection(db, "sessions"), {
                    stressScore,
                    voiceState,
                    tasks: tasks, // Syncing full task list for historical debugging
                    timestamp: serverTimestamp(),
                });
                lastSaveRef.current = now;
            } catch (e) {
                console.warn("Firebase sync failed (check config):", e);
            }
        };

        if (voiceState !== 'idle') {
            saveSession();
        }
    }, [stressScore, voiceState, tasks.length]);
};
