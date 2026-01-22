# Aura AI: The Empathic Productivity Agent

Aura is a next-generation AI personal assistant that doesn't just listen, it *feels*. By combining **Hume AI's Empathic Voice Interface (EVI)** with agentic task management, Aura senses when you are overwhelmed and proactively helps you manage your burnout before it happens.

![Aura Visualization](https://img.shields.io/badge/Aesthetics-Zen-teal)
![Framework](https://img.shields.io/badge/Framework-Next.js%2015-black)
![Intelligence](https://img.shields.io/badge/Intelligence-Hume%20EVI-blueviolet)

---

## Core Functionality

### 1. Emotional Intelligence (Prosody Sensing)
Aura analyzes the vocal tones, rhythms, and expressions in your voice using Hume's EVI. She calculates a real-time **Stress Score (0-100)** to determine your mental state.

### 2. Agentic Task Management
When Aura detects high stress levels (or when you explicitly ask), she utilizes the `manage_burnout` tool to:
- Identify low and medium priority tasks.
- Automatically reschedule them to tomorrow.
- Update the UI with smooth, fluid animations.

### 3. Productivity Analytics
Track your focus and flux with a dedicated dashboard featuring:
- **Stress Trends Chart**: Real-time visualization of your emotional state.
- **Task Velocity**: Live counts of completed vs. postponed work.

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Hume AI API Key](https://beta.hume.ai/)
- [Firebase Account](https://console.firebase.google.com/)

### 1. Environment Configuration
Create a `.env` file in the root directory (see `.env.example`):

```bash
# Hume AI
NEXT_PUBLIC_HUME_API_KEY=your_api_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_config_id

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 2. Hume Portal Setup
To enable Aura's "Agent Mode", you must configure a Tool in the [Hume Portal](https://beta.hume.ai/evi/configs):

1.  **Create Tool**: Add a tool named `manage_burnout`.
2.  **Parameters**:
    - `task_id` (string): The ID of the task to adjust.
    - `adjustment_type` (enum): `postpone`, `delegate`, or `cancel`.
3.  **LLM Selection**: Select a tool-capable model (like **Gemini 1.5 Flash** or **Claude 3.5 Sonnet**) as the supplemental LLM.

### 3. Installation
```bash
npm install
npm run dev
```

---

## Technical Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **State**: Zustand with persistence.
- **Animations**: Framer Motion (Shared Layout Animations).
- **Intelligence**: Hume EVI SDK.
- **Charts**: Recharts.
- **Persistence**: Firebase Firestore.

---

## Design Philosophy: Zen
Aura follows a **Zen Design System**:
- **Teal (#2DD4BF)**: Calm/Productive state.
- **Amber (#FBBF24)**: Warning/High workload.
- **Rose (#FB7185)**: Stressed/Burnout state.
- **Glassmorphism**: Translucent, layered UI for a premium, lightweight feel.

---

## Testing the Agent
1. Start a session.
2. Say: *"Aura, I'm feeling incredibly overwhelmed today, I can't handle the Lab Report."*
3. Watch as she calculates your stress and triggers the `manage_burnout` tool to move the task for you.

---
Developed by the Aura-AI Team.
