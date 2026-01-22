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
  isCheckoutOpen: boolean;
  emotionData: Record<string, number>;
  
  setProducts: (products: Product[]) => void;
  setFilters: (filters: Partial<Filters>) => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  setEmotionData: (emotions: Record<string, number>) => void;
  clearCart: () => void;
  clearFilters: () => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      products: [],
      filters: { category: null, color: null, maxPrice: null },
      cart: [],
      isCheckoutOpen: false,
      emotionData: {},

      setProducts: (products) => set({ products }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),

      clearFilters: () => set({
        filters: { category: null, color: null, maxPrice: null }
      }),
      
      addToCart: (product, quantity) => set((state) => {
        const existing = state.cart.find(item => item._id === product._id);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          };
        }
        return { cart: [...state.cart, { ...product, quantity }] };
      }),
      
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item._id !== productId)
      })),

      updateCartQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { cart: state.cart.filter(item => item._id !== productId) };
        }
        return {
          cart: state.cart.map(item =>
            item._id === productId ? { ...item, quantity } : item
          )
        };
      }),
      
      openCheckout: () => set({ isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
      
      setEmotionData: (emotions) => set({ emotionData: emotions }),
      
      clearCart: () => set({ cart: [] })
    }),
    { name: 'vora-storage' }
  )
);
