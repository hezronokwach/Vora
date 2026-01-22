# Vora: The Empathic Shopping Assistant

Vora is a voice-first e-commerce platform that doesn't just sell, it *understands*. By combining **Hume AI's Empathic Voice Interface (EVI)** with intelligent product recommendations, Vora senses your emotional state and adapts the shopping experience to provide comfort-driven discounts and personalized suggestions.

![Vora Visualization](https://img.shields.io/badge/Aesthetics-Zen-teal)
![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black)
![Intelligence](https://img.shields.io/badge/Intelligence-Hume%20EVI-blueviolet)

---

## Core Functionality

### 1. Emotional Intelligence (Prosody Sensing)
Vora analyzes the vocal tones, rhythms, and expressions in your voice using Hume's EVI. She calculates a real-time **Emotion Score** to determine your mental state and shopping mood.

### 2. Voice-Driven Shopping
Vora responds to natural voice commands:
- "Show me dresses under $50"
- "Add this to my cart"
- "I'm looking for something comfortable"
- Filter products by category, color, and price through conversation

### 3. Empathic Discounts
When Vora detects stress or frustration in your voice, she proactively offers comfort-driven discounts:
- Dynamic pricing based on emotional state
- Personalized discount reasoning
- Empathetic messaging without pushy sales tactics

### 4. Analytics Dashboard
Track your shopping patterns and emotional trends:
- **Emotion Score Chart**: Real-time visualization of your emotional state
- **Cart Value Tracking**: Monitor spending patterns
- **Discount Savings**: See how much empathy saved you

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Hume AI API Key](https://beta.hume.ai/)
- [Sanity CMS Account](https://www.sanity.io/)
- [Stripe Account](https://stripe.com/)
- [Firebase Account](https://console.firebase.google.com/)

### 1. Environment Configuration
Create a `.env` file in the root directory (see `.env.example`):

```bash
# Hume AI
NEXT_PUBLIC_HUME_API_KEY=your_api_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_config_id

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### 2. Hume Portal Setup
Configure voice shopping tools in the [Hume Portal](https://beta.hume.ai/evi/configs):

1. **filter_products**: Filter by category, color, max_price
2. **add_to_cart**: Add products with quantity
3. **trigger_checkout**: Open checkout modal
4. **apply_discount**: Apply emotion-based discounts

### 3. Installation
```bash
npm install
npm run dev
```

---

## Technical Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **State**: Zustand with persistence
- **Animations**: Framer Motion (Shared Layout Animations)
- **Intelligence**: Hume EVI SDK
- **CMS**: Sanity
- **Payment**: Stripe
- **Charts**: Recharts
- **Persistence**: Firebase Firestore

---

## Design Philosophy: Zen
Vora follows a **Zen Design System**:
- **Teal (#2DD4BF)**: Calm/Browsing state
- **Amber (#FBBF24)**: Engaged/Considering state
- **Rose (#FB7185)**: Stressed/Frustrated state
- **Glassmorphism**: Translucent, layered UI for a premium, lightweight feel

---

## Testing Vora
1. Start a session
2. Say: *"Show me comfortable dresses under $100"*
3. Browse products with voice commands
4. Express frustration: *"This is so expensive!"*
5. Watch Vora offer an empathetic discount

---
Developed by the Vora Team.
