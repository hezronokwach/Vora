# Vora Project Documentation

## Overview

Vora is an empathic e-commerce platform that uses Hume AI's Empathic Voice Interface (EVI) to detect user emotions and provide personalized shopping experiences with comfort-driven discounts.

## Architecture

### Frontend Stack
- **Next.js 16** (App Router) - React framework with server-side rendering
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling with custom glassmorphism variants
- **Framer Motion** - Smooth animations and transitions
- **Zustand** - Lightweight state management with persistence

### Backend Services
- **Hume AI EVI** - Emotion detection and voice interface
- **Sanity CMS** - Headless content management for products
- **Stripe** - Secure payment processing
- **Firebase Firestore** - Order persistence and analytics storage

### Key Features
- Voice-first shopping experience
- Real-time emotion detection and analysis
- Dynamic empathy-based discounts (0-25%)
- Natural language product filtering
- Voice-driven checkout and address collection
- Emotion analytics dashboard

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main marketplace interface
│   ├── orders/page.tsx    # Order history page
│   └── api/               # API routes for Stripe integration
├── components/            # React components
│   ├── ProductCard.tsx    # Product display with emotion discounts
│   ├── ProductGrid.tsx    # Responsive product grid
│   ├── CartSidebar.tsx    # Shopping cart with empathy pricing
│   ├── CheckoutModal.tsx  # Stripe checkout integration
│   ├── FilterSidebar.tsx  # Voice-responsive filters
│   ├── VoiceController.tsx # Hume EVI interface
│   ├── EnhancedAuraSphere.tsx # Emotion visualization
│   └── AnalyticsDashboard.tsx # Real-time emotion charts
├── hooks/                 # Custom React hooks
│   └── useHumeHandler.ts  # Voice command processing
├── lib/                   # Utility libraries
│   ├── sanity.ts          # CMS client and queries
│   ├── firebaseService.ts # Analytics and order storage
│   └── stripe.ts          # Payment processing
├── store/                 # State management
│   └── useMarketStore.ts  # E-commerce state with Zustand
└── types/                 # TypeScript definitions
```

## Core Components

### Emotion Detection System

The emotion detection system analyzes voice input through Hume AI's prosody analysis:

```typescript
const calculateEmotionDiscount = (prosody: any) => {
    if (!prosody?.scores) return 0;
    
    const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
    const maxStress = Math.max(
        ...stressEmotions.map(e => prosody.scores[e] || 0)
    );
    
    // Convert to discount percentage (0-25%)
    return Math.min(Math.round(maxStress * 25), 25);
};
```

### Voice Tools Integration

Vora implements 6 voice tools for Hume EVI:

1. **filter_products** - Filter products by category, color, price
2. **add_to_cart** - Add products to shopping cart
3. **trigger_checkout** - Open checkout modal
4. **apply_discount** - Apply empathy-based discounts
5. **collect_address** - Collect delivery address via voice
6. **navigate_to_orders** - Navigate to order history

### State Management

Zustand store manages the entire e-commerce state:

```typescript
interface MarketStore {
    products: Product[];
    cart: CartItem[];
    filters: ProductFilters;
    emotionData: Record<string, number>;
    deliveryAddress: string;
    // ... methods for cart, filters, checkout
}
```

## Design System

### Zen Philosophy
Vora follows a "Zen" design approach prioritizing calm and comfort:

- **Teal (#2DD4BF)** - Calm/browsing state
- **Amber (#FBBF24)** - Engaged/considering state  
- **Rose (#FB7185)** - Stressed/frustrated state

### Glassmorphism Variants
Four glassmorphism styles create depth and premium feel:

- `glass` - Standard translucent background
- `glass-card` - Card-style with subtle borders
- `glass-premium` - Enhanced with ring effects
- `glass-subtle` - Minimal transparency

## API Integration

### Hume EVI Configuration
Voice tools are configured in Hume Portal with JSON schemas:

```json
{
  "name": "filter_products",
  "description": "Filter products by category, color, or price range",
  "parameters": {
    "type": "object",
    "properties": {
      "category": {"type": "string"},
      "color": {"type": "string"},
      "max_price": {"type": "number"}
    }
  }
}
```

### Stripe Integration
Dynamic pricing with emotion discounts:

```typescript
const lineItems = cart.map(item => ({
    price_data: {
        currency: 'usd',
        product_data: { name: item.title },
        unit_amount: Math.round(item.price * (1 - emotionDiscount/100) * 100)
    },
    quantity: item.quantity
}));
```

### Sanity CMS Schema
Product schema with emotion boost values:

```typescript
{
    name: 'product',
    fields: [
        { name: 'title', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'tags', type: 'array', of: [{type: 'string'}] },
        { name: 'stock', type: 'number' },
        { name: 'emotionBoost', type: 'number' }, // 0-1 comfort factor
        { name: 'image', type: 'image' }
    ]
}
```

## Deployment

### Environment Variables
```bash
NEXT_PUBLIC_HUME_API_KEY=your_hume_api_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_hume_config_id
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_FIREBASE_CONFIG=your_firebase_config
```

### Build Commands
```bash
npm install
npm run build
npm start
```

## Analytics & Monitoring

### Emotion Tracking
Real-time emotion data is stored every 10 seconds:

```typescript
const emotionSnapshot = {
    timestamp: Date.now(),
    emotions: emotionData,
    cartValue: totalCartValue,
    sessionId: generateSessionId()
};
```

### Order Analytics
Orders include emotion context for business insights:

```typescript
const orderData = {
    items: cart,
    totalAmount: finalAmount,
    emotionDiscount: appliedDiscount,
    deliveryAddress: address,
    emotionState: currentEmotions,
    timestamp: Date.now()
};
```

## Security & Privacy

### Data Protection
- Voice data processed by Hume AI (not stored locally)
- Emotion scores aggregated, not raw audio
- Orders stored with minimal PII
- Stripe handles all payment data

### Ethical Considerations
- Discount cap prevents exploitation (max 25%)
- Empathetic messaging, not manipulative
- User control over voice sessions
- Transparent emotion detection

## Performance Optimizations

### Code Splitting
- Dynamic imports for heavy components
- Lazy loading of analytics dashboard
- Optimized bundle sizes with Next.js

### Caching Strategy
- Sanity CDN for product images
- Zustand persistence for cart state
- Firebase caching for analytics

### Voice Optimization
- 80ms audio chunks for real-time processing
- WebSocket connection management
- Audio stream cleanup on unmount

## Testing Strategy

### Unit Tests
- Component rendering and interactions
- State management logic
- Utility functions and calculations

### Integration Tests
- Voice tool execution
- Payment flow with Stripe
- Emotion discount calculations

### E2E Tests
- Complete shopping journey
- Voice command scenarios
- Checkout and order placement

## Future Enhancements

### Planned Features
- Multi-language emotion recognition
- Advanced emotion pattern analysis
- Seller analytics dashboard
- Mental health resource integration
- Cultural emotion adaptation

### Technical Improvements
- WebRTC for better audio quality
- Edge computing for faster emotion processing
- Advanced caching strategies
- Mobile app development

## Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Configure Hume Portal tools
5. Seed Sanity with sample data
6. Run development server: `npm run dev`

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Conventional commit messages
- Component documentation
- Test coverage requirements

---

*Vora represents the future of empathic e-commerce, where technology understands and responds to human emotions with genuine care.*