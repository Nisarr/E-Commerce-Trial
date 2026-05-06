import { create } from 'zustand';
import { getUserBulk } from '../services/api';
import type { UserBulkResponse } from '../types';

interface UserState {
  data: UserBulkResponse | null;
  loading: boolean;
  error: string | null;
  fetchUserData: (userId: string, customerName?: string, email?: string | null, force?: boolean) => Promise<void>;
  startPolling: (userId: string, customerName?: string, email?: string | null) => () => void;
  clearData: () => void;
}

export const useUserStore = create<UserState>((set, get) => {
  let pollInterval: ReturnType<typeof setInterval> | undefined = undefined;

  return {
    data: null,
    loading: false,
    error: null,

    fetchUserData: async (userId, customerName, email, force = false) => {
      // If we have data and it's fresh (less than 30s old), don't refetch unless forced
      const currentData = get().data;
      if (currentData && !force) {
        const age = Date.now() - new Date(currentData.timestamp).getTime();
        if (age < 30000) return; 
      }

      set({ loading: true, error: null });
      try {
        const data = await getUserBulk(userId, customerName, email, force);
        set({ data, loading: false });
      } catch (err: unknown) {
        set({ error: err instanceof Error ? err.message : 'Failed to fetch user data', loading: false });
      }
    },

    startPolling: (userId, customerName, email) => {
      if (pollInterval) return () => clearInterval(pollInterval);

      const poll = async () => {
        // Intelligent: Only poll if tab is visible
        if (document.visibilityState !== 'visible') return;
        
        try {
          const data = await getUserBulk(userId, customerName, email);
          set({ data }); // Silent update, no loading state
        } catch (err) {
          console.error("Poll failed", err);
        }
      };

      // Poll every 2 minutes (120s) - much less frequent but keeps data alive
      pollInterval = setInterval(poll, 120000);
      
      return () => {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = undefined;
        }
      };
    },

    clearData: () => {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = undefined;
      set({ data: null, error: null, loading: false });
    },
  };
});
