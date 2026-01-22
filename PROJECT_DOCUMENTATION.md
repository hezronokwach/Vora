# Aura AI - Project Documentation

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Technical Implementation](#technical-implementation)
5. [API Reference](#api-reference)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Contributing](#contributing)

---

## Overview

### What is Aura AI?
Aura AI is a voice-first productivity assistant that uses emotional intelligence to prevent burnout. Unlike traditional task managers, Aura analyzes vocal tone to detect stress and autonomously reschedules tasks before users become overwhelmed.

### Key Differentiators
- **Emotional Detection**: Real-time prosody analysis of 48 emotional signals
- **Autonomous Actions**: AI-driven task management without manual intervention
- **Scientific Foundation**: Weighted Emotional Index backed by burnout research
- **User Control**: 5-second confirmation gates and comprehensive audit trails
- **Zen Design**: Glassmorphism UI that reduces cognitive load

---

## Architecture

### System Overview
```
┌─────────────────┐
│   User Voice    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Hume AI EVI   │ ◄── Prosody Analysis (48 emotions)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Stress Engine   │ ◄── Weighted Emotional Index
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tool Calling   │ ◄── manage_burnout, end_call
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Confirmation UI │ ◄── 5-second undo window
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Task Manager   │ ◄── Zustand State + Firebase
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Action Log    │ ◄── Audit Trail
└─────────────────┘
```

### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Animations**: Framer Motion (shared layout animations)
- **UI Components**: Aceternity UI, custom glassmorphism
- **AI/Voice**: Hume AI Empathic Voice Interface (EVI)
- **Database**: Firebase Firestore (optional persistence)
- **Charts**: Recharts for analytics dashboard

---

## Core Features

### 1. Emotional Intelligence
**File**: `src/hooks/useHumeHandler.ts`

Aura analyzes vocal prosody using Hume AI's 48-dimensional emotion model:
- **Distress**: Sadness, frustration, disappointment
- **Anxiety**: Fear, nervousness, worry
- **Mental Fatigue**: Tiredness, boredom, confusion

**Stress Calculation**:
```typescript
Stress = (Distress × 0.5) + (Anxiety × 0.3) + (Mental Fatigue × 0.2)
```

**Thresholds**:
- 0-30: Calm (Green)
- 31-60: Elevated (Amber)
- 61-100: High Stress (Red)

### 2. Autonomous Task Management
**File**: `src/store/useAuraStore.ts`

When stress exceeds threshold, Aura triggers `manage_burnout` tool:
- **Postpone**: Move task to tomorrow
- **Cancel**: Remove task from list
- **Delegate**: Mark for team assignment
- **Complete**: Mark as finished

### 3. Confirmation Gates
**File**: `src/components/ConfirmActionModal.tsx`

5-second countdown modal appears before AI actions execute:
- Progress bar shows time remaining
- "Undo" button cancels action
- Auto-executes after timeout
- Prevents unwanted changes

### 4. Action Log (Audit Trail)
**File**: `src/components/ActionLog.tsx`

Tracks all AI decisions with:
- Timestamp (e.g., "10:45 AM")
- Emotion trigger (e.g., "Distress (82%)")
- Action taken (e.g., "Postponed Chemistry Lab")
- Outcome (success/cancelled/failed)
- Stress score at time of action

### 5. Visual Feedback
**File**: `src/components/EnhancedAuraSphere.tsx`

Animated sphere with orbiting particles:
- **Idle**: Slow pulsing, teal glow
- **Listening**: Faster pulsing, blue rings
- **Speaking**: Rapid pulsing, multi-color
- **Stressed**: Red glow, erratic movement

---

## Technical Implementation

### Stress Calculation Engine
**Location**: `src/hooks/useHumeHandler.ts` (line 52-98)

```typescript
const calculateStress = (prosody: any) => {
    // Extract emotion scores
    const distressScore = Math.max(...distressEmotions.map(e => prosody.scores[e] || 0));
    const anxietyScore = Math.max(...anxietyEmotions.map(e => prosody.scores[e] || 0));
    const overloadScore = Math.max(...overloadEmotions.map(e => prosody.scores[e] || 0));

    // Apply weighted formula
    const stressTotal = (distressScore * 0.5) + (anxietyScore * 0.3) + (overloadScore * 0.2);
    
    // Normalize to 0-100
    return Math.min(Math.round(stressTotal * 100), 100);
};
```

### Tool Calling Flow
**Location**: `src/hooks/useHumeHandler.ts` (line 220-270)

1. User speaks → Hume detects stress
2. AI decides to call `manage_burnout` tool
3. Tool handler extracts parameters (task_id, adjustment_type)
4. Normalizes AI variations ("done" → "complete")
5. Sets pending action in store
6. Confirmation modal appears
7. User confirms or cancels
8. Action executes and logs to audit trail

### State Management
**Location**: `src/store/useAuraStore.ts`

```typescript
interface AuraState {
    stressScore: number;
    tasks: Task[];
    voiceState: 'idle' | 'listening' | 'speaking' | 'processing';
    sessionHistory: { time: string; score: number }[];
    feedbackMessage: { text: string; type: string } | null;
    actionLogs: ActionLog[];
    currentEmotion: string;
    pendingAction: PendingAction | null;
}
```

### Animation System
**Location**: `src/components/TaskGrid.tsx`

Uses Framer Motion's LayoutGroup for cross-column morphing:
```typescript
<LayoutGroup>
    <motion.div layoutId={task.id}>
        {/* Task card content */}
    </motion.div>
</LayoutGroup>
```

---

## API Reference

### Hume AI Configuration
**Portal**: https://beta.hume.ai/evi/configs

**Required Tools**:
1. **manage_burnout**
   - Parameters: `task_id` (string), `adjustment_type` (enum: postpone/cancel/delegate/complete)
   - Description: "Reschedule or modify tasks based on user stress"

2. **end_call**
   - Parameters: None
   - Description: "End the voice session"

**Recommended LLM**: Claude 3.5 Sonnet or Gemini 1.5 Flash

### Environment Variables
```bash
NEXT_PUBLIC_HUME_API_KEY=your_api_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_config_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Deployment

### Prerequisites
- Node.js 18+
- Hume AI account with EVI access
- Firebase project (optional)

### Installation
```bash
git clone https://github.com/yourusername/aura-ai.git
cd aura-ai
npm install
```

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Deployment Platforms
- **Vercel**: Automatic deployment from GitHub
- **Netlify**: Configure build command: `npm run build`
- **AWS Amplify**: Connect repository and deploy

---

## Testing

### Manual Testing Checklist
- [ ] Voice session starts successfully
- [ ] Stress score updates in real-time
- [ ] AI detects stress and triggers tool
- [ ] Confirmation modal appears with countdown
- [ ] Undo button cancels action
- [ ] Task moves with smooth animation
- [ ] Action log records event
- [ ] Toast notification appears
- [ ] Session ends cleanly

### Test Phrases
- **High Stress**: "I'm so overwhelmed, I can't handle this anymore"
- **Task Completion**: "I just finished the Math Assignment"
- **End Session**: "Goodbye Aura, end the call"

---

## Contributing

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling
- Framer Motion for animations

### File Structure
```
src/
├── app/              # Next.js pages
├── components/       # React components
├── hooks/            # Custom hooks (Hume, Firebase)
├── store/            # Zustand state management
├── types/            # TypeScript definitions
└── lib/              # Utilities (Firebase, etc.)
```

### Key Files
- `useHumeHandler.ts`: Voice AI integration
- `useAuraStore.ts`: Global state management
- `TaskGrid.tsx`: Task management UI
- `ConfirmActionModal.tsx`: Confirmation gates
- `ActionLog.tsx`: Audit trail component

---

## Troubleshooting

### Common Issues

**Issue**: AI doesn't trigger tools  
**Solution**: Check Hume Portal configuration, ensure tool-capable LLM is selected

**Issue**: Stress score always 0  
**Solution**: Verify microphone permissions, check Hume API key

**Issue**: Tasks don't animate  
**Solution**: Ensure LayoutGroup wraps both columns, layoutId is unique

**Issue**: Confirmation modal doesn't appear  
**Solution**: Check pendingAction state in store, verify modal is rendered

---

## License
MIT License - See LICENSE file for details

## Support
- GitHub Issues: https://github.com/yourusername/aura-ai/issues
- Documentation: See STRESS_METRICS.md, DEMO_SCRIPT_V2.md
- Contact: your.email@example.com

---

**Built with ❤️ for mental health and productivity**
