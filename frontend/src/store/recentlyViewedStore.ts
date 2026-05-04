import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface RecentlyViewedState {
  items: Product[];
  addItem: (product: Product) => void;
  clear: () => void;
}

const MAX_ITEMS = 12;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          // Remove duplicate if exists, then prepend
          const filtered = state.items.filter((p) => p.id !== product.id);
          return { items: [product, ...filtered].slice(0, MAX_ITEMS) };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
);
