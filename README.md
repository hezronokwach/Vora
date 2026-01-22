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

### 1. Clone and Install
```bash
git clone <repository-url>
cd vora
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:
- **Hume AI**: Get from [Hume Portal](https://beta.hume.ai/)
- **Sanity**: Create project at [sanity.io](https://www.sanity.io/)
- **Stripe**: Get keys from [Stripe Dashboard](https://dashboard.stripe.com/)
- **Firebase**: Create project at [Firebase Console](https://console.firebase.google.com/)

### 3. Hume Portal Setup
Configure voice shopping tools following [HUME_PORTAL_SETUP.md](./HUME_PORTAL_SETUP.md):

1. Create new EVI configuration
2. Add 4 required tools (filter_products, add_to_cart, trigger_checkout, apply_discount)
3. Set empathetic system prompt
4. Copy config ID to `.env`

### 4. Sanity CMS Setup
```bash
cd sanity
npm install
npx sanity init
npx sanity deploy
```

Seed with sample products:
```bash
npx sanity dataset import SEED_DATA.ndjson production
```

### 5. Firebase Setup
1. Create Firestore database
2. Enable Authentication (optional)
3. Add your config to `.env`
4. Collections will be created automatically

### 6. Stripe Setup
1. Create Stripe account
2. Get publishable and secret keys
3. Add to `.env`
4. Test with Stripe test cards

### 7. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Vora in action.

## Testing

### Unit Tests
```bash
npm test
npm run test:watch  # Watch mode
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing
1. Start voice session
2. Say: *"Show me comfortable dresses under $100"*
3. Browse products with voice commands
4. Express frustration: *"This is so expensive!"*
5. Watch Vora offer empathetic discount

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
- **Testing**: Jest, Playwright, Testing Library

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── ProductCard.tsx  # Product display with emotion discounts
│   ├── CartSidebar.tsx  # Shopping cart with empathy pricing
│   ├── VoiceController.tsx # Hume EVI integration
│   └── AnalyticsDashboard.tsx # Real-time emotion tracking
├── hooks/               # Custom React hooks
│   └── useHumeHandler.ts # Voice command processing
├── lib/                 # Utility libraries
│   ├── sanity.ts        # CMS client
│   ├── firebaseService.ts # Analytics persistence
│   └── stripe.ts        # Payment processing
├── store/               # Zustand state management
│   └── useMarketStore.ts # E-commerce state
└── types/               # TypeScript definitions
```

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Hume Portal Setup](./HUME_PORTAL_SETUP.md)
- [Sanity CMS Schema](./sanity/SEED_DATA.md)
- [Testing Guide](./tests/)

## API Integrations

### Hume EVI
- Real-time emotion detection from voice
- Custom tool handlers for shopping actions
- Empathy-based discount calculations

### Sanity CMS
- Product catalog with emotion boost values
- Real-time content updates
- Image optimization and CDN

### Stripe
- Secure payment processing
- Dynamic pricing with emotion discounts
- Hosted checkout experience

### Firebase
- Order persistence and analytics
- Real-time emotion tracking
- Admin dashboard data

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
