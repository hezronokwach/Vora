'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getOrders, getAnalyticsSessions, Order, AnalyticsSession } from '@/lib/firebaseService';
import { Package, TrendingUp, Users, DollarSign } from 'lucide-react';

export const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sessions, setSessions] = useState<AnalyticsSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, sessionsData] = await Promise.all([
          getOrders(20),
          getAnalyticsSessions(10)
        ]);
        setOrders(ordersData);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalSavings = orders.reduce((sum, order) => sum + order.discountAmount, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 rounded-2xl">
          <p className="text-white/70">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white/90">Admin Dashboard</h1>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-calm/20 rounded-lg">
                <Package size={24} className="text-calm" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Orders</p>
                <p className="text-2xl font-bold text-white/90">{orders.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Revenue</p>
                <p className="text-2xl font-bold text-white/90">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <TrendingUp size={24} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Avg Order Value</p>
                <p className="text-2xl font-bold text-white/90">${avgOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 rounded-lg">
                <Users size={24} className="text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Empathy Savings</p>
                <p className="text-2xl font-bold text-white/90">${totalSavings.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-white/90 mb-4">Recent Orders</h2>
          
          {orders.length === 0 ? (
            <p className="text-white/60 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 10).map((order, index) => (
                <div
                  key={order.id || index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white/90 font-medium">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-white/60 text-sm">
                      {order.timestamp?.toDate?.()?.toLocaleDateString() || 'Recent'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white/90 font-bold">${order.total.toFixed(2)}</p>
                    {order.emotionDiscount > 0 && (
                      <p className="text-calm text-sm">
                        {order.emotionDiscount}% empathy discount
                      </p>
                    )}
                  </div>
                </div>
              ))}\n            </div>\n          )}\n        </motion.div>\n\n        {/* Analytics Sessions */}\n        <motion.div\n          initial={{ opacity: 0, y: 20 }}\n          animate={{ opacity: 1, y: 0 }}\n          transition={{ delay: 0.5 }}\n          className=\"glass-card p-6 rounded-xl\"\n        >\n          <h2 className=\"text-xl font-bold text-white/90 mb-4\">Recent Sessions</h2>\n          \n          {sessions.length === 0 ? (\n            <p className=\"text-white/60 text-center py-8\">No session data yet</p>\n          ) : (\n            <div className=\"space-y-4\">\n              {sessions.map((session, index) => (\n                <div\n                  key={session.id || index}\n                  className=\"flex items-center justify-between p-4 bg-white/5 rounded-lg\"\n                >\n                  <div>\n                    <p className=\"text-white/90 font-medium\">\n                      Session {session.sessionId?.slice(-8) || index + 1}\n                    </p>\n                    <p className=\"text-white/60 text-sm\">\n                      Peak emotion: {session.peakEmotionScore?.toFixed(0) || 0}%\n                    </p>\n                  </div>\n                  \n                  <div className=\"text-right\">\n                    <p className=\"text-white/90\">\n                      ${session.totalSavings?.toFixed(2) || '0.00'} saved\n                    </p>\n                    <p className=\"text-white/60 text-sm\">\n                      {session.completedPurchase ? 'Purchased' : 'Browsed'}\n                    </p>\n                  </div>\n                </div>\n              ))}\n            </div>\n          )}\n        </motion.div>\n      </div>\n    </div>\n  );\n};