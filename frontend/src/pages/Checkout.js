import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, CheckCircle, ArrowLeft, ShoppingBag, Lock, Truck, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { validateCard, processPayment, createOrder, saveOrder } from '../utils/payment';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [cart, setCart] = useState(() => location.state?.cart || []);
  const [total, setTotal] = useState(() => location.state?.total || 0);
  const [step, setStep] = useState('checkout'); // checkout, processing, success
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!cart || cart.length === 0) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        const cartTotal = parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotal(cartTotal);
      }
    }
  }, [cart]);

  const calculateDiscount = () => {
    const studyHours = user?.total_study_hours || 0;
    if (studyHours >= 10) return 0.20;
    if (studyHours >= 5) return 0.15;
    if (studyHours >= 2) return 0.10;
    return 0.05;
  };

  const discount = total * calculateDiscount();
  const finalTotal = total - discount;

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      const validation = validateCard(cardDetails);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    setProcessing(true);
    setStep('processing');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const order = await createOrder({
        items: cart,
        paymentMethod,
        paymentDetails: cardDetails,
        discount: calculateDiscount(),
      });

      saveOrder(order);
      setStep('success');
      
      toast.success('Payment successful!');
      
      setTimeout(() => {
        setCart([]);
        localStorage.removeItem('cart');
        navigate('/orders', { state: { orderId: order.id } });
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
      setStep('checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <CheckCircle className="w-24 h-24 mx-auto mb-6" style={{ color: '#39FF14' }} />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">Your order has been placed successfully.</p>
          <p className="text-sm text-muted-foreground">Redirecting to orders...</p>
        </motion.div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF007F] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Processing Payment...</h2>
          <p className="text-muted-foreground">Please wait while we process your payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/food')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Food
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Outfit' }}>Payment Details</CardTitle>
                <CardDescription>Complete your purchase securely</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4">
                    <div className="flex items-center space-x-2 border border-border rounded-lg p-4 flex-1 cursor-pointer hover:border-primary">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="w-4 h-4" /> Credit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border border-border rounded-lg p-4 flex-1 cursor-pointer hover:border-primary">
                      <RadioGroupItem value="coins" id="coins" />
                      <Label htmlFor="coins" className="flex items-center gap-2 cursor-pointer">
                        <Wallet className="w-4 h-4" /> Coins
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
                    <div className="space-y-2">
                      <Label>Cardholder Name</Label>
                      <Input 
                        placeholder="John Doe" 
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input 
                        placeholder="4242 4242 4242 4242" 
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry</Label>
                        <Input 
                          placeholder="MM/YY" 
                          value={cardDetails.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2);
                            setCardDetails({...cardDetails, expiry: val});
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CVC</Label>
                        <Input 
                          placeholder="123" 
                          type="password"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" /> Your payment is secure
                    </div>
                  </div>
                )}

                {paymentMethod === 'coins' && (
                  <div className="p-4 bg-secondary rounded-lg border border-border text-center">
                    <p className="text-muted-foreground mb-2">Your Balance</p>
                    <p className="text-3xl font-bold" style={{ color: '#FFE600' }}>{user?.coins || 0}</p>
                    <p className="text-sm text-muted-foreground mt-2">Cost: {Math.round(finalTotal)} coins</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handlePayment} disabled={processing} className="w-full py-6 text-lg" style={{ background: '#FF007F' }}>
                  {processing ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
                  {!processing && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card className="bg-card border-border sticky top-6">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Outfit' }}>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div 
                      key={item.food_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 p-3 bg-secondary rounded-lg border border-border"
                    >
                      <img src={item.image} alt={item.food_name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.food_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold" style={{ fontFamily: 'JetBrains Mono' }}>${(item.price * item.quantity).toFixed(2)}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span style={{ color: '#39FF14' }}>-${discount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span>Total</span>
                    <span style={{ color: '#FFE600', fontFamily: 'JetBrains Mono' }}>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4">
                  <Truck className="w-4 h-4" /> Free delivery on orders over $20
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
