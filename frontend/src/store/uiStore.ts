import { create } from 'zustand';

interface UIState {
  activeProductTitle: string | null;
  setActiveProductTitle: (title: string | null) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeProductTitle: null,
  setActiveProductTitle: (title) => set({ activeProductTitle: title }),
  isAdminModalOpen: false,
  setIsAdminModalOpen: (isOpen) => set({ isAdminModalOpen: isOpen }),
}));
