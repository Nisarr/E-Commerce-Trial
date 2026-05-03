import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customerName: user?.username || '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
  });

  const subtotal = items.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0);
  const shipping = items.length > 0 ? 15 : 0; // Flat shipping for now
  const total = subtotal + shipping;

  const handleQuantityChange = (id: string, qty: number) => {
    if (qty < 1) return;
    updateQuantity(id, qty);
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

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        items: items.map(i => ({
          productId: i.product.id,
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
                <div className="text-accent font-bold mt-1">${(item.product.salePrice || item.product.price).toFixed(2)}</div>
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
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="text-2xl font-black font-garamond text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold text-primary">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="font-bold text-primary">${shipping.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-100 my-4" />
              <div className="flex justify-between text-lg font-black text-primary">
                <span>Total</span>
                <span className="text-accent">${total.toFixed(2)}</span>
              </div>
            </div>

            <h3 className="font-bold text-primary mb-4 border-t pt-4">Shipping Details</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
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
                  placeholder="(555) 123-4567"
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
                  placeholder="123 Main St, City, Country"
                  required
                />
              </div>

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
