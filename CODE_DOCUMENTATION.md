# Vora Code Documentation

## Core Components

### useHumeHandler.ts
**Purpose**: Main hook for Hume EVI integration and voice command processing

**Key Functions**:
```typescript
// Calculates emotion-based discount from prosody data
const calculateEmotionDiscount = (prosody: any) => {
    const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
    const maxStress = Math.max(...stressEmotions.map(e => prosody.scores[e] || 0));
    return Math.min(Math.round(maxStress * 25), 25); // Cap at 25%
};

// Handles voice tool execution
case 'tool_call':
    const toolName = msg.name;
    const toolParams = JSON.parse(msg.parameters);
    // Execute appropriate tool based on toolName
```

**Voice Tools Implemented**:
- `filter_products`: Updates store filters based on voice input
- `add_to_cart`: Finds product by ID/title and adds to cart
- `trigger_checkout`: Opens checkout modal
- `apply_discount`: Applies empathy discount
- `collect_address`: Formats and saves delivery address
- `navigate_to_orders`: Navigates to orders page with delay

### useMarketStore.ts
**Purpose**: Zustand store managing e-commerce state with persistence

**State Structure**:
```typescript
interface MarketStore {
    // Product data
    products: Product[];
    filteredProducts: Product[];
    
    // Shopping cart
    cart: CartItem[];
    cartOpen: boolean;
    
    // Filters and search
    filters: ProductFilters;
    searchQuery: string;
    
    // Emotion and analytics
    emotionData: Record<string, number>;
    emotionHistory: EmotionSnapshot[];
    
    // Checkout and orders
    checkoutOpen: boolean;
    deliveryAddress: string;
    
    // UI state
    notifications: Notification[];
}
```

**Key Methods**:
```typescript
// Add product to cart with stock validation
addToCart: (product: Product, quantity: number = 1) => {
    const existingItem = cart.find(item => item._id === product._id);
    const currentQuantity = existingItem?.quantity || 0;
    
    if (currentQuantity + quantity > product.stock) {
        // Show stock warning
        return;
    }
    // Add to cart logic
};

// Apply filters to products
setFilters: (newFilters: Partial<ProductFilters>) => {
    const filtered = products.filter(product => {
        // Category filter
        if (newFilters.category && product.category !== newFilters.category) return false;
        // Color filter (check tags)
        if (newFilters.color && !product.tags.includes(newFilters.color)) return false;
        // Price filter
        if (newFilters.maxPrice && product.price > newFilters.maxPrice) return false;
        return true;
    });
    set({ filteredProducts: filtered, filters: { ...filters, ...newFilters } });
};
```

### ProductCard.tsx
**Purpose**: Individual product display with emotion-based discount badges

**Key Features**:
```typescript
// Calculate emotion discount for product
const emotionDiscount = useMemo(() => {
    if (!emotionData) return 0;
    const stressEmotions = ['distress', 'frustration', 'anxiety', 'sadness'];
    const maxStress = Math.max(...stressEmotions.map(e => emotionData[e] || 0));
    return Math.min(Math.round(maxStress * 25), 25);
}, [emotionData]);

// Discounted price calculation
const discountedPrice = useMemo(() => {
    return product.price * (1 - emotionDiscount / 100);
}, [product.price, emotionDiscount]);
```

**Animation System**:
```typescript
// Framer Motion variants for smooth interactions
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, transition: { duration: 0.2 } }
};
```

### CartSidebar.tsx
**Purpose**: Slide-in shopping cart with empathy pricing

**Empathy Messaging**:
```typescript
const getEmpathyMessage = (discount: number) => {
    if (discount >= 20) return "I can sense you're having a tough day. Here's some extra comfort.";
    if (discount >= 10) return "You seem a bit stressed. Let me help make this easier.";
    if (discount > 0) return "I want you to feel good about this purchase.";
    return "You seem calm and happy today!";
};
```

**Cart Calculations**:
```typescript
const { subtotal, totalDiscount, finalTotal } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (emotionDiscount / 100);
    return {
        subtotal,
        totalDiscount: discountAmount,
        finalTotal: subtotal - discountAmount
    };
}, [cart, emotionDiscount]);
```

### VoiceController.tsx
**Purpose**: Compact voice interface with emotion visualization

**Voice State Management**:
```typescript
const getVoiceStateColor = (state: string) => {
    switch (state) {
        case 'listening': return 'text-teal-400';
        case 'speaking': return 'text-amber-400';
        case 'processing': return 'text-purple-400';
        default: return 'text-gray-400';
    }
};
```

**Session Controls**:
```typescript
const handleVoiceToggle = async () => {
    if (status === 'IDLE') {
        await startSession();
    } else {
        await endSession();
    }
};
```

### AnalyticsDashboard.tsx
**Purpose**: Real-time emotion and cart tracking visualization

**Data Processing**:
```typescript
// Process emotion history for charts
const emotionChartData = useMemo(() => {
    return emotionHistory.slice(-20).map((snapshot, index) => ({
        time: index,
        stress: (snapshot.emotions.distress || 0) * 100,
        joy: (snapshot.emotions.joy || 0) * 100,
        engagement: (snapshot.emotions.interest || 0) * 100
    }));
}, [emotionHistory]);

// Cart value tracking
const cartChartData = useMemo(() => {
    return emotionHistory.slice(-20).map((snapshot, index) => ({
        time: index,
        value: snapshot.cartValue || 0,
        discount: snapshot.emotionDiscount || 0
    }));
}, [emotionHistory]);
```

## Utility Libraries

### sanity.ts
**Purpose**: Sanity CMS client and product queries

```typescript
// Fetch all products with image URLs
export const getProducts = async (): Promise<Product[]> => {
    const products = await client.fetch(`
        *[_type == "product"] {
            _id,
            title,
            price,
            category,
            tags,
            stock,
            emotionBoost,
            description,
            "imageUrl": image.asset->url,
            slug
        }
    `);
    return products;
};

// Update product stock
export const updateProductStock = async (productId: string, newStock: number) => {
    return client.patch(productId).set({ stock: newStock }).commit();
};
```

### firebaseService.ts
**Purpose**: Order persistence and analytics storage

```typescript
// Save order with emotion context
export const saveOrder = async (orderData: OrderData) => {
    const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        timestamp: serverTimestamp(),
        emotionContext: {
            discount: orderData.emotionDiscount,
            primaryEmotion: getPrimaryEmotion(orderData.emotionState)
        }
    });
    return docRef.id;
};

// Track emotion snapshots
export const saveEmotionSnapshot = async (snapshot: EmotionSnapshot) => {
    await addDoc(collection(db, 'emotionAnalytics'), {
        ...snapshot,
        timestamp: serverTimestamp()
    });
};
```

### stripe.ts
**Purpose**: Payment processing with dynamic pricing

```typescript
// Create checkout session with emotion discount
export const createCheckoutSession = async (
    cart: CartItem[],
    emotionDiscount: number,
    deliveryAddress: string
) => {
    const lineItems = cart.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.title,
                images: item.imageUrl ? [item.imageUrl] : []
            },
            unit_amount: Math.round(item.price * (1 - emotionDiscount/100) * 100)
        },
        quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        metadata: {
            emotionDiscount: emotionDiscount.toString(),
            deliveryAddress
        }
    });

    return session;
};
```

## Design System Implementation

### Glassmorphism Variants
```css
/* Tailwind CSS custom utilities */
.glass {
    @apply bg-white/10 backdrop-blur-md border border-white/20;
}

.glass-card {
    @apply bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl;
}

.glass-premium {
    @apply bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl ring-1 ring-white/10;
}

.glass-subtle {
    @apply bg-white/5 backdrop-blur-sm border border-white/5;
}
```

### Emotion-Driven Theming
```typescript
// Dynamic background based on emotion state
const getEmotionTheme = (emotions: Record<string, number>) => {
    const stress = Math.max(
        emotions.distress || 0,
        emotions.frustration || 0,
        emotions.anxiety || 0
    );
    
    if (stress > 0.7) return 'bg-gradient-to-br from-rose-900/20 to-purple-900/20';
    if (stress > 0.4) return 'bg-gradient-to-br from-amber-900/20 to-orange-900/20';
    return 'bg-gradient-to-br from-teal-900/20 to-cyan-900/20';
};
```

## Error Handling

### Voice Tool Error Management
```typescript
try {
    // Execute tool logic
    const toolResult = await executeTool(toolName, toolParams);
    
    // Send success response
    socketRef.current.sendToolResponseMessage({
        toolCallId,
        content: toolResult
    });
} catch (error: any) {
    // Send error response to EVI
    socketRef.current.sendToolErrorMessage({
        toolCallId,
        error: "Tool execution failed",
        content: error.message
    });
}
```

### Stock Validation
```typescript
const validateStock = (product: Product, requestedQuantity: number) => {
    const currentCartQuantity = cart.find(item => item._id === product._id)?.quantity || 0;
    const totalQuantity = currentCartQuantity + requestedQuantity;
    
    if (totalQuantity > product.stock) {
        showNotification({
            type: 'warning',
            message: `Only ${product.stock} items available in stock`
        });
        return false;
    }
    return true;
};
```

## Performance Optimizations

### Memoization Strategy
```typescript
// Expensive calculations memoized
const filteredProducts = useMemo(() => {
    return products.filter(product => {
        // Filter logic
    });
}, [products, filters]);

const emotionDiscount = useMemo(() => {
    // Discount calculation
}, [emotionData]);
```

### Lazy Loading
```typescript
// Dynamic imports for heavy components
const AnalyticsDashboard = dynamic(() => import('./AnalyticsDashboard'), {
    loading: () => <div>Loading analytics...</div>
});
```

### Audio Stream Management
```typescript
// Cleanup audio resources
useEffect(() => {
    return () => {
        if (recorderRef.current) {
            recorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (playerRef.current) {
            playerRef.current.dispose();
        }
    };
}, []);
```

---

*This documentation covers the core implementation details of Vora's empathic e-commerce platform, focusing on emotion detection, voice interaction, and user experience optimization.*