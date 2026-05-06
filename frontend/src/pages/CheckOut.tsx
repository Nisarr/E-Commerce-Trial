import React, { useEffect, useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getAddresses, getWallet, createOrder, chargeWallet } from '../services/api';
import type { Address } from '../types';
import { ShoppingBag, ArrowRight, Loader2, MapPin, ChevronDown, Ticket, X, CheckCircle, Wallet, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CheckOut: React.FC = () => {
  const { items, selectedItemIds, removeItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState({ bkash_number: '', nagad_number: '' });

  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

  // Filter items to only show selected ones
  const selectedItems = items.filter(item => selectedItemIds.includes(item.product.id));

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

  const applyAddress = React.useCallback((addr: Address) => {
    const fullAddress = [addr.address, addr.city, addr.postalCode].filter(Boolean).join(', ');
    setFormData((prev) => ({
      ...prev,
      customerName: addr.fullName || prev.customerName,
      customerPhone: addr.phone || prev.customerPhone,
      shippingAddress: fullAddress,
    }));
    
    if (addr.city && addr.city.toLowerCase().includes('dhaka')) {
      setShippingZone('dhaka');
    } else if (addr.city) {
      setShippingZone('outside');
    }

    setShowAddressPicker(false);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.fullName || user.username || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
      }));

      if (user.id) {
        getWallet(user.id!).then(data => setWalletBalance(data.balance)).catch(() => {});
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/v1/settings');
        if (res.ok) {
          const data = await res.json();
          setPaymentSettings({
            bkash_number: data.bkash_number || '017XX-XXXXXX',
            nagad_number: data.nagad_number || '017XX-XXXXXX'
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getAddresses(user.id!)
        .then((addrs) => {
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault);
          if (defaultAddr && !formData.shippingAddress) {
            applyAddress(defaultAddr);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user?.id, applyAddress, formData.shippingAddress]);

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0);
  const shipping = selectedItems.length > 0 ? (shippingZone === 'dhaka' ? 60 : 120) : 0;
  const total = Math.max(0, subtotal + shipping - couponDiscount);
  const finalPayable = useWallet ? Math.max(0, total - walletBalance) : total;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/v1/coupons/validate?code=${couponCode}&total=${subtotal}`);
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
    if (selectedItems.length === 0) return;

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
      let walletCharged = 0;
      if (useWallet && walletBalance > 0 && user?.id) {
        walletCharged = Math.min(walletBalance, total);
        await chargeWallet({
          userId: user.id!,
          amount: walletCharged,
          reference: 'Payment for Order'
        });
      }
 
      const payload = {
        ...formData,
        userId: user?.id || null,
        totalAmount: total,
        paymentMethod: useWallet && finalPayable === 0 ? 'wallet' : paymentMethod,
        paymentPhone: paymentMethod !== 'cod' ? paymentPhone : null,
        paymentTrxId: paymentMethod !== 'cod' ? paymentTrxId : null,
        items: selectedItems.map(i => ({
          productId: i.product.id,
          productName: i.product.title,
          quantity: i.quantity,
          price: i.product.salePrice || i.product.price
        }))
      };
 
      await createOrder(payload);
 
      // Only clear selected items from cart
      selectedItems.forEach(item => removeItem(item.product.id));
      toast.success('Order placed successfully!', {
        duration: 5000,
        style: {
          background: '#1a2b4b',
          color: '#fff',
          borderRadius: '16px',
          fontWeight: 'bold',
        },
      });
      navigate('/account', { state: { orderPlaced: true } });
    } catch (err: unknown) {
      const msg = (err as Error).message;
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={48} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-black font-garamond text-primary mb-4">No items selected</h2>
          <p className="text-muted mb-8 max-w-md">You haven't selected any items from your cart to checkout.</p>
          <button 
            onClick={() => navigate('/cart')}
            className="px-8 py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all flex items-center gap-2"
          >
            Back to Cart <ArrowLeft size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/cart')}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-4xl font-black font-garamond text-primary">Checkout</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Order Summary Button */}
        <div className="lg:hidden mb-6">
          <button 
            onClick={() => setShowOrderDetailsModal(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-100 transition-all"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase text-muted tracking-widest">Order Details</span>
              <span className="text-sm font-bold text-primary">{selectedItems.length} items to be ordered</span>
            </div>
            <div className="flex items-center gap-2 text-accent font-black">
              <span>৳{total.toLocaleString()}</span>
              <ChevronDown size={18} />
            </div>
          </button>
        </div>

        {/* Checkout Form */}
        <div className="flex-grow space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-primary mb-6">Shipping Details</h3>
            
            {isAuthenticated && savedAddresses.length > 0 && (
              <div className="mb-6">
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

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setShippingZone('dhaka')}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${shippingZone === 'dhaka' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  Inside Dhaka (৳60)
                </button>
                <button
                  type="button"
                  onClick={() => setShippingZone('outside')}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${shippingZone === 'outside' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  Outside Dhaka (৳120)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-1">Phone *</label>
                <input 
                  type="tel" 
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none"
                  placeholder="House, Road, Area, City"
                  required
                />
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-primary mb-6">Payment Method</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary text-white shadow-md' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'bkash' ? 'border-[#e2136e] bg-[#e2136e] text-white shadow-md' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                bKash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'nagad' ? 'border-[#f7941d] bg-[#f7941d] text-white shadow-md' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                Nagad
              </button>
            </div>

            {paymentMethod !== 'cod' && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 space-y-4 mb-6">
                <div className="text-sm text-orange-800">
                  <p className="font-bold mb-1 uppercase tracking-wider text-xs opacity-70">Payment Instructions:</p>
                  <p className="font-medium text-base mb-2">Please Send Money to our Personal Number:</p>
                  <p className="font-black text-2xl tracking-tighter">
                    {paymentMethod === 'bkash' ? paymentSettings.bkash_number : paymentSettings.nagad_number}
                  </p>
                  <p className="mt-2 font-bold">Total Amount: <span className="text-xl tracking-tight">৳{finalPayable.toLocaleString()}</span></p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-orange-100">
                  <div>
                    <label className="block text-xs font-bold text-orange-900 mb-1.5 uppercase tracking-wider">Your {paymentMethod.toUpperCase()} Number *</label>
                    <input 
                      type="text" 
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-orange-900 mb-1.5 uppercase tracking-wider">Transaction ID (TrxID) *</label>
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
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="text-2xl font-black font-garamond text-primary mb-6">Order Summary</h2>
            
            {/* Order Details (Selected Items) */}
            <div className="mb-6 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <h4 className="text-xs font-black uppercase text-muted tracking-widest mb-2">Items being ordered</h4>
              {selectedItems.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center pb-3 border-b border-gray-50 last:border-0">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={(() => {
                        try {
                          const parsed = JSON.parse(item.product.images as unknown as string);
                          return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : 'https://placehold.co/100x100?text=No+Image';
                        } catch {
                          return 'https://placehold.co/100x100?text=No+Image';
                        }
                      })()} 
                      alt={item.product.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-primary truncate">{item.product.title}</p>
                    <p className="text-xs text-muted">{item.quantity} x ৳{(item.product.salePrice || item.product.price).toLocaleString()}</p>
                  </div>
                  <div className="text-sm font-black text-primary">
                    ৳{((item.product.salePrice || item.product.price) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm mb-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
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

              {isAuthenticated && walletBalance > 0 && (
                <div className="pt-3 border-t border-purple-100">
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
                      <p className="text-[10px] text-muted mt-0.5">Balance: ৳{walletBalance.toLocaleString()}</p>
                    </div>
                  </label>
                  {useWallet && (
                    <div className="mt-2 flex justify-between text-xs font-bold text-purple-700">
                      <span>Wallet Deduction:</span>
                      <span>-৳{Math.min(walletBalance, total).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="h-px bg-gray-100 my-4" />
              <div className="flex justify-between text-xl font-black text-primary">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
              {useWallet && (
                <div className="flex justify-between text-sm font-bold text-accent">
                  <span>Payable Now:</span>
                  <span>৳{finalPayable.toLocaleString()}</span>
                </div>
              )}
            </div>

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

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={24} /> Processing...</>
              ) : (
                <>Place Order <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>
      <OrderDetailsModal 
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        items={selectedItems}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        couponDiscount={couponDiscount}
        couponApplied={couponApplied}
      />
    </div>
  );
};

// Order Details Modal for Mobile
const OrderDetailsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  items: any[]; 
  subtotal: number;
  shipping: number;
  total: number;
  couponDiscount: number;
  couponApplied: string | null;
}> = ({ isOpen, onClose, items, subtotal, shipping, total, couponDiscount, couponApplied }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full duration-500">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-black font-garamond text-primary">Order Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-muted">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <h4 className="text-[10px] font-black uppercase text-muted tracking-widest">Items being ordered</h4>
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 items-center pb-4 border-b border-gray-50 last:border-0">
              <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={(() => {
                    try {
                      const parsed = JSON.parse(item.product.images as unknown as string);
                      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : 'https://placehold.co/100x100?text=No+Image';
                    } catch {
                      return 'https://placehold.co/100x100?text=No+Image';
                    }
                  })()} 
                  alt={item.product.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold text-primary">{item.product.title}</p>
                <p className="text-xs text-muted">{item.quantity} x ৳{(item.product.salePrice || item.product.price).toLocaleString()}</p>
              </div>
              <div className="text-sm font-black text-primary">
                ৳{((item.product.salePrice || item.product.price) * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50/80 border-t border-gray-100 space-y-3">
          <div className="flex justify-between text-xs font-bold text-muted uppercase tracking-wider">
            <span>Subtotal</span>
            <span className="text-primary tracking-normal">৳{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-muted uppercase tracking-wider">
            <span>Shipping</span>
            <span className="text-primary tracking-normal">৳{shipping.toLocaleString()}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-xs font-bold text-green-600 uppercase tracking-wider">
              <span>Coupon ({couponApplied})</span>
              <span className="tracking-normal">-৳{couponDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
            <span className="text-sm font-black text-primary uppercase">Total</span>
            <span className="text-2xl font-black text-accent tracking-tighter">৳{total.toLocaleString()}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-4 mt-2 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/10 transition-transform active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
