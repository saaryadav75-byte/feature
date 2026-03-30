import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, CheckCircle, ArrowLeft, ShoppingBag, Calendar, Truck, X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { validateCard, processPayment, createOrder, saveOrder, getStoredOrders } from '../utils/payment';

const MOCK_FOOD_ITEMS = [
  { id: 'food_1', name: 'Brain Food Platter', category: 'breakfast', price: 8.99, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', nutrition_score: 9, description: 'A healthy mix of nuts, fruits, and yogurt' },
  { id: 'food_2', name: 'Focus Energy Smoothie', category: 'snack', price: 6.99, image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400', nutrition_score: 8, description: 'Green smoothie with matcha for focus' },
  { id: 'food_3', name: 'Study Lunch Box', category: 'lunch', price: 12.99, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', nutrition_score: 10, description: 'Balanced meal with protein and grains' },
  { id: 'food_4', name: 'Evening Brain Boost', category: 'dinner', price: 14.99, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', nutrition_score: 9, description: 'Omega-3 rich dinner' },
  { id: 'food_5', name: 'Protein Power Bowl', category: 'lunch', price: 11.99, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', nutrition_score: 9, description: 'High-protein bowl with quinoa' },
  { id: 'food_6', name: 'Smart Snack Pack', category: 'snack', price: 5.99, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400', nutrition_score: 7, description: 'Trail mix with dark chocolate' },
  { id: 'food_7', name: 'Morning Mind Starter', category: 'breakfast', price: 7.99, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', nutrition_score: 8, description: 'Oatmeal with berries' },
  { id: 'food_8', name: 'Midday Reset Salad', category: 'lunch', price: 10.99, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', nutrition_score: 9, description: 'Fresh salad with salmon' },
  { id: 'food_9', name: 'Pre-Study Coffee', category: 'snack', price: 4.99, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', nutrition_score: 6, description: 'Coffee with lion\'s mane' },
  { id: 'food_10', name: 'Victory Dinner', category: 'dinner', price: 15.99, image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400', nutrition_score: 10, description: 'Celebratory meal' },
];

export default function FoodCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetchFoodData();
  }, []);

  const fetchFoodData = async () => {
    try {
      const itemsRes = await api.get('/food-items');
      if (itemsRes.data && itemsRes.data.length > 0) {
        setFoodItems(itemsRes.data);
        setRecommendations(itemsRes.data.slice(0, 3));
      } else {
        setFoodItems(MOCK_FOOD_ITEMS);
        setRecommendations(MOCK_FOOD_ITEMS.slice(0, 3));
      }
    } catch (error) {
      setFoodItems(MOCK_FOOD_ITEMS);
      setRecommendations(MOCK_FOOD_ITEMS.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.food_id === item.id);
    if (existingItem) {
      setCart(cart.map(i => i.food_id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { food_id: item.id, food_name: item.name, quantity: 1, price: item.price, image: item.image }]);
    }
    toast.success(`Added ${item.name} to cart`);
  };

  const updateQuantity = (foodId, delta) => {
    const updatedCart = cart.map(item => {
      if (item.food_id === foodId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0);
    setCart(updatedCart);
  };

  const calculateDiscount = () => {
    const studyHours = user?.total_study_hours || 0;
    if (studyHours >= 10) return 0.20;
    if (studyHours >= 5) return 0.15;
    if (studyHours >= 2) return 0.10;
    return 0.05;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cartTotal * calculateDiscount();
  const finalTotal = cartTotal - discount;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = selectedCategory === 'all' 
    ? foodItems 
    : foodItems.filter(item => item.category === selectedCategory);

  const categories = ['all', 'breakfast', 'snack', 'lunch', 'dinner'];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF007F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading food menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 bg-background dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Food & Rewards</h1>
          <p className="text-muted-foreground text-lg">Fuel your brain with healthy options!</p>
        </motion.div>

        {recommendations.length > 0 && (
          <Card className="mb-8" style={{ background: 'linear-gradient(135deg, rgba(255,0,127,0.1), rgba(255,230,0,0.1))' }}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                <CheckCircle className="w-6 h-6" style={{ color: '#FFE600' }} /> Recommended For You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {recommendations.slice(0, 3).map((item) => (
                  <motion.div key={item.id} whileHover={{ y: -4 }} className="p-4 rounded-xl bg-secondary dark:bg-zinc-800 border border-border dark:border-zinc-700 cursor-pointer" onClick={() => addToCart(item)}>
                    <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-semibold mb-1">{item.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#FFE600' }}>${item.price}</span>
                      <Badge variant="secondary">Score: {item.nutrition_score}/10</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)} className="capitalize" style={selectedCategory === cat ? { background: '#FF007F' } : {}}>
              {cat}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-card border-border dark:border-zinc-700">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                  All Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
                  {filteredItems.map((foodItem) => (
                    <motion.div key={foodItem.id} variants={item}>
                      <Card className="bg-secondary dark:bg-zinc-800 border-border dark:border-zinc-700 hover:border-primary/50 transition-colors overflow-hidden group">
                        <div className="aspect-video overflow-hidden">
                          <img src={foodItem.image} alt={foodItem.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{foodItem.name}</h3>
                            <Badge variant="outline" className="text-xs">{foodItem.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{foodItem.description}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#FFE600' }}>${foodItem.price}</span>
                            </div>
                            <Button size="sm" onClick={() => addToCart(foodItem)} style={{ background: '#FF007F' }}>
                              <Plus className="w-4 h-4 mr-1" /> Add
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
            <Card className="bg-card border-border dark:border-zinc-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                  Your Cart
                  {cartItemCount > 0 && <Badge style={{ background: '#FF007F' }}>{cartItemCount}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((cartItem) => (
                      <div key={cartItem.food_id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary dark:bg-zinc-800 border border-border dark:border-zinc-700">
                        <img src={cartItem.image} alt={cartItem.food_name} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{cartItem.food_name}</p>
                          <p className="text-xs text-muted-foreground">${cartItem.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateQuantity(cartItem.food_id, -1)}><Minus className="w-3 h-3" /></Button>
                          <span className="text-sm font-bold w-6 text-center">{cartItem.quantity}</span>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateQuantity(cartItem.food_id, 1)}><Plus className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ))}

                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount ({(calculateDiscount() * 100).toFixed(0)}%)</span><span style={{ color: '#39FF14' }}>-${discount.toFixed(2)}</span></div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border dark:border-zinc-700">
                        <span>Total</span>
                        <span style={{ color: '#FFE600' }}>${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button onClick={() => navigate('/checkout', { state: { cart, total: finalTotal } })} className="w-full text-white font-semibold py-6" style={{ background: '#FF007F' }}>
                      Proceed to Checkout
                    </Button>
                  </div>
                )}

                <div className="mt-6 p-4 rounded-lg border border-border dark:border-zinc-700" style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(57,255,20,0.1))' }}>
                  <p className="text-xs text-muted-foreground mb-2">Study More, Save More!</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>2+ hours: 10% off</span><span style={{ color: (user?.total_study_hours || 0) >= 2 ? '#39FF14' : '' }}>{(user?.total_study_hours || 0) >= 2 ? '✓' : ''}</span></div>
                    <div className="flex justify-between"><span>5+ hours: 15% off</span><span style={{ color: (user?.total_study_hours || 0) >= 5 ? '#39FF14' : '' }}>{(user?.total_study_hours || 0) >= 5 ? '✓' : ''}</span></div>
                    <div className="flex justify-between"><span>10+ hours: 20% off</span><span style={{ color: (user?.total_study_hours || 0) >= 10 ? '#39FF14' : '' }}>{(user?.total_study_hours || 0) >= 10 ? '✓' : ''}</span></div>
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
