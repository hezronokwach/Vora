import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { CartItem } from '@/store/useMarketStore';

export interface Order {
  id?: string;
  items: CartItem[];
  subtotal: number;
  emotionDiscount: number;
  discountAmount: number;
  total: number;
  emotionData: Record<string, number>;
  timestamp: Timestamp;
  sessionId: string;
}

export interface AnalyticsSession {
  id?: string;
  sessionId: string;
  emotionSnapshots: {
    timestamp: Timestamp;
    emotionData: Record<string, number>;
    cartValue: number;
    discountApplied: number;
  }[];
  totalDuration: number;
  peakEmotionScore: number;
  totalSavings: number;
  itemsViewed: number;
  itemsAddedToCart: number;
  completedPurchase: boolean;
  createdAt: Timestamp;
}

// Generate session ID
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Orders collection
export const createOrder = async (orderData: Omit<Order, 'id' | 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      timestamp: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('Error creating order:', error);
    return null;
  }
};

export const getOrders = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

// Analytics sessions collection
export const createAnalyticsSession = async (sessionData: Omit<AnalyticsSession, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'analytics_sessions'), {
      ...sessionData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating analytics session:', error);
    throw error;
  }
};

export const getAnalyticsSessions = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'analytics_sessions'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalyticsSession[];
  } catch (error) {
    console.error('Error fetching analytics sessions:', error);
    return [];
  }
};

// Add emotion snapshot to session
export const addEmotionSnapshot = async (
  sessionId: string,
  emotionData: Record<string, number>,
  cartValue: number,
  discountApplied: number
) => {
  const snapshot = {
    timestamp: Timestamp.now(),
    emotionData,
    cartValue,
    discountApplied,
  };
  
  // In a real app, you'd update the existing session document
  // For now, we'll store individual snapshots
  try {
    await addDoc(collection(db, 'emotion_snapshots'), {
      sessionId,
      ...snapshot,
    });
  } catch (error) {
    console.warn('Error adding emotion snapshot:', error);
  }
};