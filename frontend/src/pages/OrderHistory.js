import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { ShoppingBag, Calendar, DollarSign, Coins, CreditCard } from 'lucide-react';
import { getStoredOrders } from '../utils/payment';

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
      if (response.data && response.data.length > 0) {
        setOrders(response.data);
      } else {
        setOrders(getStoredOrders());
      }
    } catch (error) {
      console.log('Using local orders');
      setOrders(getStoredOrders());
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
    <div className="min-h-screen p-6 lg:p-12 bg-background dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <Button onClick={() => navigate('/profile')} variant="ghost" className="mb-6">← Back to Profile</Button>
        
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
              <ShoppingBag className="w-8 h-8 text-[#FF007F]" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No orders yet</p>
                <Button onClick={() => navigate('/food')} className="mt-4" style={{ background: '#FF007F' }}>Browse Food</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div key={order.id} className="p-6 rounded-xl bg-secondary border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-lg">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge style={{ background: '#39FF14', color: 'black' }}>{order.status}</Badge>
                    </div>
                    
                    <div className="border-t border-border pt-4 mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Items:</p>
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm mb-1">
                          <span>{item.food_name} × {item.quantity}</span>
                          <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${order.subtotal?.toFixed(2) || order.total?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span style={{ color: '#39FF14' }}>-${order.discount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                        <span>Total Paid</span>
                        <span style={{ color: '#FFE600' }}>${order.final_price?.toFixed(2) || order.total?.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {order.payment_method === 'Credit Card' ? (
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Coins className="w-4 h-4 text-[#FFE600]" />
                        )}
                        <span className="text-xs text-muted-foreground">Payment: {order.payment_method}</span>
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
