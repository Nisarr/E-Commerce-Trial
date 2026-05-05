import { create } from 'zustand';
import { getHomeBulk } from '../services/api';
import type { HomeBulkResponse } from '../types';

interface HomeState {
  data: HomeBulkResponse | null;
  loading: boolean;
  error: string | null;
  _promise: Promise<void> | null;
  fetchHomeData: (force?: boolean) => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  _promise: null,
  fetchHomeData: async (force = false) => {
    // Already have data and not forced — skip
    if (get().data && !force) return;

    // If already fetching, return the in-flight promise (deduplication)
    const existing = get()._promise;
    if (existing && !force) return existing;

    const promise = (async () => {
      set({ loading: true, error: null });
      try {
        const data = await getHomeBulk();
        set({ data, loading: false, _promise: null });
      } catch (err: any) {
        set({ error: err.message || 'Failed to fetch home data', loading: false, _promise: null });
      }
    })();

    set({ _promise: promise });
    return promise;
  },
}));
