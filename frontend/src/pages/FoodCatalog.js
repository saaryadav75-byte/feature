import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Sparkles, Clock, TrendingUp, Coffee } from 'lucide-react';
import { toast } from 'sonner';

export default function FoodCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodData();
  }, []);

  const fetchFoodData = async () => {
    try {
      const [itemsRes, recoRes] = await Promise.all([
        api.get('/food-items'),
        api.get('/food-items/recommend')
      ]);
      
      if (itemsRes.data.length === 0) {
        await seedFoodItems();
        const newItemsRes = await api.get('/food-items');
        setFoodItems(newItemsRes.data);
      } else {
        setFoodItems(itemsRes.data);
      }
      
      setRecommendations(recoRes.data.recommended || []);
    } catch (error) {
      console.error('Failed to fetch food data:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedFoodItems = async () => {
    const sampleItems = [
      {
        name: 'Energy Smoothie Bowl',
        category: 'breakfast',
        price: 8.99,
        image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
        nutrition_score: 9,
        description: 'Packed with fruits, nuts, and energy-boosting ingredients'
      },
      {
        name: 'Brain Food Salad',
        category: 'lunch',
        price: 12.50,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        nutrition_score: 10,
        description: 'Fresh greens with omega-3 rich salmon and walnuts'
      },
      {
        name: 'Mixed Nuts & Berries',
        category: 'snack',
        price: 5.99,
        image: 'https://images.pexels.com/photos/6928273/pexels-photo-6928273.jpeg',
        nutrition_score: 8,
        description: 'Perfect study snack for sustained energy'
      },
      {
        name: 'Protein Power Bowl',
        category: 'lunch',
        price: 14.99,
        image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        nutrition_score: 9,
        description: 'Quinoa, grilled chicken, and fresh vegetables'
      },
      {
        name: 'Green Energy Juice',
        category: 'snack',
        price: 6.50,
        image: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg',
        nutrition_score: 8,
        description: 'Refreshing blend of greens and fruits'
      },
      {
        name: 'Mediterranean Wrap',
        category: 'dinner',
        price: 11.99,
        image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
        nutrition_score: 9,
        description: 'Healthy wrap with hummus and grilled vegetables'
      }
    ];

    for (const item of sampleItems) {
      try {
        await api.post('/food-items', item);
      } catch (error) {
        console.log('Skipping item, might already exist');
      }
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.food_id === item.id);
    if (existingItem) {
      setCart(cart.map(i =>
        i.food_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, {
        food_id: item.id,
        food_name: item.name,
        quantity: 1,
        price: item.price
      }]);
    }
    toast.success(`Added ${item.name} to cart`);
  };

  const updateQuantity = (foodId, delta) => {
    setCart(cart.map(item => {
      if (item.food_id === foodId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const response = await api.post('/orders', { items: cart });
      toast.success(`Order placed! Total: $${response.data.final_price.toFixed(2)} (${(response.data.discount / response.data.total * 100).toFixed(0)}% discount applied)`);
      setCart([]);
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF007F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading food menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-12 noise-bg" style={{ background: '#09090B' }} data-testid="food-catalog-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>
            Food & Rewards
          </h1>
          <p className="text-zinc-400 text-lg">Fuel your brain with healthy options and earn discounts!</p>
        </motion.div>

        {recommendations.length > 0 && (
          <Card className="border-[#FF007F]/30 bg-gradient-to-br from-[#FF007F]/10 to-[#FFE600]/10 mb-8 shadow-[0_0_30px_rgba(255,0,127,0.1)]">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                <Sparkles className="w-6 h-6 text-[#FFE600]" />
                Recommended For You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {recommendations.slice(0, 3).map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4 }}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#FF007F] transition-all cursor-pointer"
                    onClick={() => addToCart(item)}
                    data-testid={`recommended-food-${item.id}`}
                  >
                    <div className="aspect-square rounded-lg bg-zinc-900 mb-3 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-semibold mb-1">{item.name}</h4>
                    <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#FFE600' }}>
                        ${item.price}
                      </span>
                      <Badge variant="secondary" className="text-xs">Score: {item.nutrition_score}/10</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                  <Coffee className="w-6 h-6 text-[#FF007F]" />
                  All Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid md:grid-cols-2 gap-4"
                >
                  {foodItems.map((foodItem) => (
                    <motion.div key={foodItem.id} variants={item}>
                      <Card className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors overflow-hidden group" data-testid={`food-item-${foodItem.id}`}>
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={foodItem.image}
                            alt={foodItem.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{foodItem.name}</h3>
                            <Badge variant="outline" className="text-xs">{foodItem.category}</Badge>
                          </div>
                          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{foodItem.description}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#FFE600' }}>
                                ${foodItem.price}
                              </span>
                              <span className="text-xs text-zinc-500 ml-2">Health: {foodItem.nutrition_score}/10</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addToCart(foodItem)}
                              className="bg-[#FF007F] hover:bg-[#FF007F]/90 text-white"
                              data-testid={`add-to-cart-${foodItem.id}`}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-zinc-800 bg-zinc-950 sticky top-6" data-testid="cart-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                  <ShoppingCart className="w-6 h-6 text-[#00F0FF]" />
                  Your Cart
                  {cartItemCount > 0 && (
                    <Badge className="ml-auto bg-[#FF007F]">{cartItemCount}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((cartItem) => (
                      <div key={cartItem.food_id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{cartItem.food_name}</p>
                          <p className="text-xs text-zinc-500">${cartItem.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(cartItem.food_id, -1)}
                            data-testid={`decrease-qty-${cartItem.food_id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold w-6 text-center" style={{ fontFamily: 'JetBrains Mono' }}>
                            {cartItem.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(cartItem.food_id, 1)}
                            data-testid={`increase-qty-${cartItem.food_id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-zinc-800 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Subtotal</span>
                        <span className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Study Discount
                        </span>
                        <span className="font-semibold text-[#39FF14]" style={{ fontFamily: 'JetBrains Mono' }}>
                          {user?.total_study_hours >= 10 ? '20%' : user?.total_study_hours >= 5 ? '15%' : user?.total_study_hours >= 2 ? '10%' : '5%'}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-800">
                        <span>Total</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#FFE600' }}>
                          ${(cartTotal * (1 - (user?.total_study_hours >= 10 ? 0.2 : user?.total_study_hours >= 5 ? 0.15 : user?.total_study_hours >= 2 ? 0.1 : 0.05))).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-[#FF007F] hover:bg-[#FF007F]/90 text-white font-semibold text-lg py-6"
                      data-testid="checkout-button"
                    >
                      Place Order
                    </Button>
                  </div>
                )}

                <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-[#00F0FF]/10 to-[#39FF14]/10 border border-zinc-800">
                  <p className="text-xs text-zinc-400 mb-2">💡 Study More, Save More!</p>
                  <div className="space-y-1 text-xs text-zinc-500">
                    <div className="flex justify-between">
                      <span>2+ hours: 10% off</span>
                      <span className={user?.total_study_hours >= 2 ? 'text-[#39FF14]' : ''}>✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5+ hours: 15% off</span>
                      <span className={user?.total_study_hours >= 5 ? 'text-[#39FF14]' : ''}>✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>10+ hours: 20% off</span>
                      <span className={user?.total_study_hours >= 10 ? 'text-[#39FF14]' : ''}>✓</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
