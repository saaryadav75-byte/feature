import api from './api';

const PAYMENT_CONFIG = {
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY || '',
  CURRENCY: 'inr',
  PROCESSING_FEE: 0.029,
  FIXED_FEE: 0.30,
};

export const calculateOrderTotal = (items, discountPercent = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * discountPercent;
  const total = subtotal - discount;
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

export const validateCard = (cardDetails) => {
  const { number, expiry, cvc, name } = cardDetails;
  
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Please enter cardholder name' };
  }

  const cardNumber = number.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cardNumber)) {
    return { valid: false, error: 'Please enter a valid 16-digit card number' };
  }

  if (!/^\d{3,4}$/.test(cvc)) {
    return { valid: false, error: 'Please enter a valid CVC' };
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { valid: false, error: 'Please enter expiry in MM/YY format' };
  }

  const [month, year] = expiry.split('/').map(Number);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid expiry month' };
  }
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, error: 'Card has expired' };
  }

  return { valid: true, error: null };
};

export const simulateCardPayment = async (cardDetails, amount) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const cardNumber = cardDetails.number.replace(/\s/g, '');
  const last4 = cardNumber.slice(-4);
  
  const isSuccessful = !['4000', '5000'].includes(cardNumber.slice(0, 4));
  
  if (isSuccessful) {
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${last4}`,
      last4,
      amount,
      timestamp: new Date().toISOString(),
      message: 'Payment processed successfully',
    };
  } else {
    throw new Error('Payment declined. Please try another card.');
  }
};

export const processPayment = async (paymentMethod, paymentDetails, orderData) => {
  const { items, discount = 0 } = orderData;
  const { total } = calculateOrderTotal(items, discount);

  if (paymentMethod === 'card') {
    const validation = validateCard(paymentDetails);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const result = await simulateCardPayment(paymentDetails, total);
    return {
      success: true,
      method: 'card',
      transactionId: result.transactionId,
      last4: result.last4,
      amount: result.amount,
      timestamp: result.timestamp,
    };
  }

  if (paymentMethod === 'coins') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      method: 'coins',
      coinsUsed: Math.round(total),
      amount: total,
      timestamp: new Date().toISOString(),
    };
  }

  if (paymentMethod === 'free') {
    return {
      success: true,
      method: 'free',
      amount: 0,
      timestamp: new Date().toISOString(),
    };
  }

  throw new Error('Invalid payment method');
};

export const createOrder = async (orderData) => {
  const { items, paymentMethod, paymentDetails, discount = 0 } = orderData;
  const { total } = calculateOrderTotal(items, discount);

  const paymentResult = await processPayment(paymentMethod, paymentDetails, {
    items,
    discount,
  });

  const order = {
    id: `order_${Date.now()}`,
    items: items.map(item => ({
      food_id: item.food_id,
      food_name: item.food_name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: calculateOrderTotal(items).subtotal,
    discount: calculateOrderTotal(items).subtotal - total,
    final_price: total,
    payment_method: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'coins' ? 'Coins' : 'Free',
    transaction_id: paymentResult.transactionId || `free_${Date.now()}`,
    status: 'confirmed',
    created_at: new Date().toISOString(),
  };

  try {
    await api.post('/orders', order);
  } catch (error) {
    console.log('Order saved locally only');
  }

  return order;
};

export const getStoredOrders = () => {
  try {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
  } catch {
    return [];
  }
};

export const saveOrder = (order) => {
  const orders = getStoredOrders();
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));
};

export default {
  calculateOrderTotal,
  validateCard,
  simulateCardPayment,
  processPayment,
  createOrder,
  getStoredOrders,
  saveOrder,
};
