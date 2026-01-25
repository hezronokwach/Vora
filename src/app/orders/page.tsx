'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Calendar } from 'lucide-react';

interface Order {
  id: string;
  items: any[];
  total: number;
  deliveryAddress: string;
  timestamp: number;
  emotionDiscount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load orders from localStorage for demo
    const savedOrders = localStorage.getItem('vora-orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-calm" />
          <h1 className="text-3xl font-bold">Your Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-white/60">Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                    <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-calm">${order.total.toFixed(2)}</p>
                    {order.emotionDiscount > 0 && (
                      <p className="text-xs text-calm/80">
                        {order.emotionDiscount}% empathy discount applied
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.title} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.deliveryAddress && (
                  <div className="flex items-center gap-2 text-sm text-white/70 pt-4 border-t border-white/10">
                    <MapPin className="w-4 h-4" />
                    <span>Delivery to: {order.deliveryAddress}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}