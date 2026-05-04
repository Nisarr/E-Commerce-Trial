import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  id?: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  isVerified?: number;
  role: 'admin' | 'user';
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  login: (username: string, role: 'admin' | 'user', extraData?: Partial<UserData>, token?: string) => void;
  updateUser: (data: Partial<UserData>) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (username, role, extraData = {}, token) =>
        set({
          isAuthenticated: true,
          user: { username, role, ...extraData },
          token: token || null,
        }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      setToken: (token) => set({ token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
