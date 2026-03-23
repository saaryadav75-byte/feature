import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { ShoppingBag, Calendar, DollarSign, Coins } from 'lucide-react';

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/checkout/orders/history');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen p-6 lg:p-12 noise-bg" style={{ background: '#09090B' }}>
      <div className="max-w-5xl mx-auto">
        <Button onClick={() => navigate('/profile')} variant="ghost" className="mb-6">← Back to Profile</Button>
        
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
              <ShoppingBag className="w-8 h-8 text-[#FF007F]" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8"><div className="w-12 h-12 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No orders yet</p>
                <Button onClick={() => navigate('/food')} className="mt-4 bg-[#FF007F] hover:bg-[#FF007F]/90">Browse Food</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div key={order.id} className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-lg">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge className="bg-[#39FF14] text-black">{order.status}</Badge>
                    </div>
                    
                    <div className="border-t border-zinc-800 pt-4 mb-4">
                      <p className="text-sm text-zinc-500 mb-2">Items:</p>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm mb-1">
                          <span>{item.food_name} × {item.quantity}</span>
                          <span className="text-zinc-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-zinc-800 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Subtotal</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Discount</span>
                        <span className="text-[#39FF14]">-${order.discount.toFixed(2)}</span>
                      </div>
                      {order.coins_used > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Coins className="w-4 h-4 text-[#FFE600]" />
                            Coins Used
                          </span>
                          <span className="text-[#FFE600]">-{order.coins_used}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-800">
                        <span>Total Paid</span>
                        <span style={{ color: '#FFE600' }}>${order.final_price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <DollarSign className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs text-zinc-500">Payment: {order.payment_method}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
