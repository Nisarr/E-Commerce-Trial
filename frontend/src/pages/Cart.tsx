import React, { useEffect, useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getAddresses, getWallet } from '../services/api';
import type { Address } from '../types';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, MapPin, ChevronDown, Ticket, X, CheckCircle, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Wallet
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [useWallet, setUseWallet] = useState(false);

  // Shipping Logic
  const [shippingZone, setShippingZone] = useState<'dhaka' | 'outside'>('dhaka');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentTrxId, setPaymentTrxId] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        customerName: user.fullName || user.username || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
        shippingAddress: prev.shippingAddress,
      }));

      // Fetch wallet balance
      if (user.id) {
        getWallet(user.id).then(data => setWalletBalance(data.balance)).catch(() => {});
      }
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getAddresses(user.id)
        .then((addrs) => {
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault);
          if (defaultAddr && !formData.shippingAddress) {
            applyAddress(defaultAddr);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  const applyAddress = (addr: Address) => {
    const fullAddress = [addr.address, addr.city, addr.postalCode].filter(Boolean).join(', ');
    setFormData((prev) => ({
      ...prev,
      customerName: addr.fullName || prev.customerName,
      customerPhone: addr.phone || prev.customerPhone,
      shippingAddress: fullAddress,
    }));
    
    // Auto detect shipping zone based on city
    if (addr.city && addr.city.toLowerCase().includes('dhaka')) {
      setShippingZone('dhaka');
    } else if (addr.city) {
      setShippingZone('outside');
    }

    setShowAddressPicker(false);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0);
  const shipping = items.length > 0 ? (shippingZone === 'dhaka' ? 60 : 120) : 0;
  const total = Math.max(0, subtotal + shipping - couponDiscount);
  const finalPayable = useWallet ? Math.max(0, total - walletBalance) : total;

  const handleQuantityChange = (id: string, qty: number) => {
    if (qty < 1) return;
    updateQuantity(id, qty);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/v1/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.salePrice || i.product.price }))
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponDiscount(data.discount);
        setCouponApplied(couponCode.toUpperCase());
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code.');
        setCouponDiscount(0);
        setCouponApplied(null);
      }
    } catch {
      setCouponError('Failed to validate coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(null);
    setCouponError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!formData.customerName || !formData.customerPhone || !formData.shippingAddress) {
      setError('Please fill in all required fields.');
      return;
    }

    if (paymentMethod !== 'cod' && (!paymentPhone || !paymentTrxId)) {
      setError(`Please provide your ${paymentMethod.toUpperCase()} phone number and Transaction ID.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Charge Wallet if selected
      let walletCharged = 0;
      if (useWallet && walletBalance > 0) {
        walletCharged = Math.min(walletBalance, total);
        await fetch('/api/v1/wallet/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            amount: walletCharged,
            reference: 'Payment for Order'
          })
        });
      }

      // Step 2: Place Order
      const payload = {
        ...formData,
        userId: user?.id || null,
        totalAmount: total, // send final total
        paymentMethod: useWallet && finalPayable === 0 ? 'wallet' : paymentMethod,
        paymentPhone: paymentMethod !== 'cod' ? paymentPhone : null,
        paymentTrxId: paymentMethod !== 'cod' ? paymentTrxId : null,
        items: items.map(i => ({
          productId: i.product.id,
          productName: i.product.title,
          quantity: i.quantity,
          price: i.product.salePrice || i.product.price
        }))
      };

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to place order');
      }

      clearCart();
      navigate('/account', { state: { orderPlaced: true } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={48} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-black font-garamond text-primary mb-4">Your cart is empty</h2>
          <p className="text-muted mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products and find something you love!</p>
          <button 
            onClick={() => navigate('/shop')}
            className="px-8 py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all flex items-center gap-2"
          >
            Start Shopping <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-black font-garamond text-primary mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-grow space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                {item.product.images && item.product.images.length > 0 && item.product.images[0] !== '[]' ? (
                  <img 
                    src={(() => {
                      try {
                        const parsed = JSON.parse(item.product.images as unknown as string);
                        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : 'https://placehold.co/100x100?text=No+Image';
                      } catch (e) {
                        return 'https://placehold.co/100x100?text=No+Image';
                      }
                    })()} 
                    alt={item.product.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={24}/></div>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-primary text-lg">{item.product.title}</h3>
                <p className="text-sm text-muted">{item.product.brand}</p>
                <div className="text-accent font-bold mt-1">৳{(item.product.salePrice || item.product.price).toFixed(2)}</div>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                <button 
                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm hover:text-accent"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm hover:text-accent"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <button 
                onClick={() => removeItem(item.product.id)}
                className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors ml-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Form & Summary */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="text-2xl font-black font-garamond text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold text-primary">৳{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-muted">
                <span>Shipping</span>
                <span className="font-bold text-primary">৳{shipping.toLocaleString()}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Ticket size={14} /> Coupon ({couponApplied})</span>
                  <span className="font-bold">-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="h-px bg-gray-100 my-4" />
              <div className="flex justify-between text-lg font-black text-primary">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Wallet Integration */}
            {isAuthenticated && walletBalance > 0 && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useWallet} 
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <Wallet size={16} /> Pay with Wallet
                    </span>
                    <p className="text-xs text-muted mt-1">Available balance: <strong className="text-primary">৳{walletBalance.toLocaleString()}</strong></p>
                  </div>
                </label>
                {useWallet && (
                  <div className="mt-3 pt-3 border-t border-purple-200 flex justify-between text-sm font-black text-primary">
                    <span>Payable via COD:</span>
                    <span>৳{finalPayable.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Coupon Input */}
            <div className="mb-6">
              {couponApplied ? (
                <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="flex items-center gap-2 text-sm font-bold text-green-700">
                    <CheckCircle size={16} /> {couponApplied} applied
                  </span>
                  <button onClick={removeCoupon} className="p-1 text-green-600 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-grow px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold focus:border-accent focus:ring-1 focus:ring-accent outline-none uppercase tracking-wider"
                    placeholder="PROMO CODE"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : <Ticket size={14} />}
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 font-bold mt-1.5 ml-1">{couponError}</p>}
            </div>

            <h3 className="font-bold text-primary mb-4 border-t pt-4">Shipping Details</h3>

            {/* Saved Address Selector */}
            {isAuthenticated && savedAddresses.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAddressPicker(!showAddressPicker)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={16} />
                      Use Saved Address
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${showAddressPicker ? 'rotate-180' : ''}`} />
                  </button>
                  {showAddressPicker && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => applyAddress(addr)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-black uppercase text-accent">{addr.label}</span>
                            {addr.isDefault ? (
                              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                            ) : null}
                          </div>
                          <p className="text-sm font-bold text-primary">{addr.fullName}</p>
                          <p className="text-xs text-muted truncate">{addr.address}, {addr.city}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setShippingZone('dhaka')}
                  className={`py-2 px-3 rounded-xl border text-sm font-bold transition-colors ${shippingZone === 'dhaka' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  Inside Dhaka (৳60)
                </button>
                <button
                  type="button"
                  onClick={() => setShippingZone('outside')}
                  className={`py-2 px-3 rounded-xl border text-sm font-bold transition-colors ${shippingZone === 'outside' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  Outside Dhaka (৳120)
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Email</label>
                <input 
                  type="email" 
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Phone *</label>
                <input 
                  type="tel" 
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  placeholder="+880 1XXXXXXXXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary mb-1">Shipping Address *</label>
                <textarea 
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none"
                  placeholder="House, Road, Area, City"
                  required
                />
              </div>

              <h3 className="font-bold text-primary mb-4 border-t pt-4">Payment Method</h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`py-2 px-2 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary text-white shadow-md' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`py-2 px-2 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'bkash' ? 'border-[#e2136e] bg-[#e2136e] text-white shadow-md' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`py-2 px-2 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'nagad' ? 'border-[#f7941d] bg-[#f7941d] text-white shadow-md' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  Nagad
                </button>
              </div>

              {paymentMethod !== 'cod' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="text-sm text-orange-800">
                    <p className="font-bold mb-1">Please Send Money to our Personal Number:</p>
                    <p className="font-black text-lg">017XX-XXXXXX</p>
                    <p className="mt-1">Amount to send: <strong>৳{finalPayable.toLocaleString()}</strong></p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-orange-900 mb-1 uppercase tracking-wider">Your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Number *</label>
                      <input 
                        type="text" 
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-orange-900 mb-1 uppercase tracking-wider">Transaction ID (TrxID) *</label>
                      <input 
                        type="text" 
                        value={paymentTrxId}
                        onChange={(e) => setPaymentTrxId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all uppercase tracking-widest font-mono text-sm"
                        placeholder="8A7B6C5D4E"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-accent text-white rounded-xl font-bold text-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={24} /> Processing...</>
                ) : (
                  <>Place Order <ArrowRight size={20} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
