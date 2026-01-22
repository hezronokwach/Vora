export interface ActionLog {
    id: string;
    timestamp: number;
    time: string;
    triggerEmotion: string;
    action: string;
    outcome: 'success' | 'cancelled' | 'failed';
    stressScore: number;
}
