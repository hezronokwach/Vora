import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  stock: number;
  image: any;
  category: string;
  tags: string[];
  emotionBoost: number;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface Filters {
  category: string | null;
  color: string | null;
  maxPrice: number | null;
}

interface MarketState {
  products: Product[];
  filters: Filters;
  cart: CartItem[];
  cartOpen: boolean;
  checkoutOpen: boolean;
  filterOpen: boolean;
  emotionData: Record<string, number>;
  notification: { message: string; type: 'success' | 'error' } | null;
  loadingStates: Record<string, boolean>;
  
  setProducts: (products: Product[]) => void;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  setCartOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  setFilterOpen: (open: boolean) => void;
  setEmotionData: (emotions: Record<string, number>) => void;
  clearCart: () => void;
  reduceStock: (productId: string, quantity: number) => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
  clearNotification: () => void;
  setLoading: (key: string, loading: boolean) => void;
  
  // Computed properties
  get cartTotal(): number;
  get emotionDiscount(): number;
  get finalTotal(): number;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      products: [],
      filters: { category: null, color: null, maxPrice: null },
      cart: [],
      cartOpen: false,
      checkoutOpen: false,
      filterOpen: false,
      emotionData: {},
      notification: null,
      loadingStates: {},

      setProducts: (products) => set({ products }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),

      clearFilters: () => set({
        filters: { category: null, color: null, maxPrice: null }
      }),
      
      addToCart: (product, quantity) => set((state) => {
        const existing = state.cart.find(item => item._id === product._id);
        const currentQuantity = existing ? existing.quantity : 0;
        const newQuantity = currentQuantity + quantity;
        
        // Check stock limit
        if (newQuantity > product.stock) {
          console.warn(`Cannot add ${quantity} items. Only ${product.stock - currentQuantity} available.`);
          return {
            ...state,
            notification: { message: `Only ${product.stock - currentQuantity} items available`, type: 'error' }
          };
        }
        
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item._id === product._id
                ? { ...item, quantity: newQuantity }
                : item
            ),
            notification: { message: `${product.title} quantity updated`, type: 'success' }
          };
        }
        return { 
          cart: [...state.cart, { ...product, quantity }],
          notification: { message: `${product.title} added to cart`, type: 'success' }
        };
      }),
      
      removeFromCart: (productId) => set((state) => {
        const item = state.cart.find(item => item._id === productId);
        return {
          cart: state.cart.filter(item => item._id !== productId),
          notification: item ? { message: `${item.title} removed from cart`, type: 'success' } : null
        };
      }),

      updateCartQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { cart: state.cart.filter(item => item._id !== productId) };
        }
        
        const product = state.cart.find(item => item._id === productId);
        if (product && quantity > product.stock) {
          console.warn(`Cannot set quantity to ${quantity}. Only ${product.stock} available.`);
          return state;
        }
        
        return {
          cart: state.cart.map(item =>
            item._id === productId ? { ...item, quantity } : item
          )
        };
      }),
      
      setCartOpen: (open) => set({ cartOpen: open }),
      setCheckoutOpen: (open) => set({ checkoutOpen: open }),
      setFilterOpen: (open) => set({ filterOpen: open }),
      
      setEmotionData: (emotions) => set({ emotionData: emotions }),
      
      clearCart: () => set({ cart: [] }),
      
      reduceStock: (productId, quantity) => set((state) => ({
        products: state.products.map(product =>
          product._id === productId
            ? { ...product, stock: Math.max(0, product.stock - quantity) }
            : product
        )
      })),
      
      showNotification: (message, type) => set({ notification: { message, type } }),
      clearNotification: () => set({ notification: null }),
      setLoading: (key, loading) => set((state) => ({
        loadingStates: { ...state.loadingStates, [key]: loading }
      })),
      
      // Computed properties
      get cartTotal() {
        return get().cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },
      
      get emotionDiscount() {
        const emotions = get().emotionData;
        const stressEmotions = ['Stress', 'Frustration', 'Anxiety', 'Sadness'];
        const maxStress = Math.max(...stressEmotions.map(e => emotions[e] || 0));
        return Math.min(Math.round(maxStress * 25), 25);
      },
      
      get finalTotal() {
        const total = get().cartTotal;
        const discount = get().emotionDiscount;
        return total * (1 - discount / 100);
      },
      
      get filteredProducts() {
        const { products, filters } = get();
        return products.filter(product => {
          if (filters.category && product.category !== filters.category) return false;
          if (filters.maxPrice && product.price > filters.maxPrice) return false;
          if (filters.color && !product.tags.some(tag => 
            tag.toLowerCase().includes(filters.color!.toLowerCase())
          )) return false;
          return true;
        });
      }
    }),
    { name: 'vora-storage' }
  )
);
