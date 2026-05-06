import { create } from 'zustand';

interface UIState {
  activeProductTitle: string | null;
  setActiveProductTitle: (title: string | null) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (isOpen: boolean) => void;
  adminTheme: 'light' | 'dark';
  toggleAdminTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeProductTitle: null,
  setActiveProductTitle: (title) => set({ activeProductTitle: title }),
  isAdminModalOpen: false,
  setIsAdminModalOpen: (isOpen) => set({ isAdminModalOpen: isOpen }),
  adminTheme: (localStorage.getItem('adminTheme') as 'light' | 'dark') || 'light',
  toggleAdminTheme: () => set((state) => {
    const newTheme = state.adminTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('adminTheme', newTheme);
    return { adminTheme: newTheme };
  }),
}));
