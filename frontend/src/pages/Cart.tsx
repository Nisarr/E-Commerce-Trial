import React from 'react';
import { useCartStore } from '../store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { items, selectedItemIds, removeItem, updateQuantity, toggleSelection, setSelectedItems, clearSelection } = useCartStore();
  const navigate = useNavigate();

  const handleQuantityChange = (id: string, qty: number) => {
    if (qty < 1) return;
    updateQuantity(id, qty);
  };

  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length;
  
  const toggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      setSelectedItems(items.map(item => item.product.id));
    }
  };

  const selectedItemsCount = selectedItemIds.length;
  const subtotal = items
    .filter(item => selectedItemIds.includes(item.product.id))
    .reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0);

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
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-black font-garamond text-primary">Your Cart</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-colors"
          >
            {isAllSelected ? <CheckSquare size={20} className="text-accent" /> : <Square size={20} />}
            Select All ({items.length})
          </button>
          {selectedItemsCount > 0 && (
            <button 
              onClick={clearSelection}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Deselect All
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-grow space-y-4">
          {items.map((item) => {
            const isSelected = selectedItemIds.includes(item.product.id);
            return (
              <div 
                key={item.product.id} 
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all flex gap-4 items-center ${isSelected ? 'border-accent shadow-md' : 'border-gray-100'}`}
              >
                <button 
                  onClick={() => toggleSelection(item.product.id)}
                  className={`flex-shrink-0 transition-colors ${isSelected ? 'text-accent' : 'text-gray-300'}`}
                >
                  {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                </button>

                <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  {item.product.images && item.product.images.length > 0 && item.product.images[0] !== '[]' ? (
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
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={24}/></div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-bold text-primary text-lg leading-tight mb-1">{item.product.title}</h3>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider mb-2">{item.product.brand}</p>
                  <div className="text-accent font-black text-xl">৳{(item.product.salePrice || item.product.price).toLocaleString()}</div>
                </div>
                
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button 
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm hover:text-accent transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-black w-6 text-center text-primary">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm hover:text-accent transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.product.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Summary Floating Bar / Sidebar */}
        <div className="w-full lg:w-[350px] flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="text-2xl font-black font-garamond text-primary mb-6">Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-muted text-sm font-medium">
                <span>Selected Items</span>
                <span className="font-bold text-primary">{selectedItemsCount}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-muted text-sm font-medium">Subtotal</span>
                <span className="text-2xl font-black text-primary tracking-tighter">৳{subtotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted text-center italic">Shipping and discounts will be calculated at checkout</p>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              disabled={selectedItemsCount === 0}
              className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-accent/20"
            >
              Checkout Now <ArrowRight size={20} />
            </button>
            
            <button 
              onClick={() => navigate('/shop')}
              className="w-full mt-4 py-3 bg-gray-50 text-primary rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
