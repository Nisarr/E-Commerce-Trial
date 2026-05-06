import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  selectedItemIds: string[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleSelection: (productId: string) => void;
  setSelectedItems: (productIds: string[]) => void;
  clearSelection: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      selectedItemIds: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          const newSelected = state.selectedItemIds.includes(product.id) 
            ? state.selectedItemIds 
            : [...state.selectedItemIds, product.id];
          
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              selectedItemIds: newSelected
            };
          }
          return { 
            items: [...state.items, { product, quantity }],
            selectedItemIds: newSelected
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
          selectedItemIds: state.selectedItemIds.filter(id => id !== productId)
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [], selectedItemIds: [] }),
      toggleSelection: (productId) =>
        set((state) => ({
          selectedItemIds: state.selectedItemIds.includes(productId)
            ? state.selectedItemIds.filter(id => id !== productId)
            : [...state.selectedItemIds, productId]
        })),
      setSelectedItems: (productIds) => set({ selectedItemIds: productIds }),
      clearSelection: () => set({ selectedItemIds: [] }),
    }),
    {
      name: 'playpen-cart',
    }
  )
);
