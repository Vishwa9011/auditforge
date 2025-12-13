import { create } from 'zustand';

type SidebarState = {
    isOpen: boolean;
    toggleSidebar: (value?: boolean) => void;
    openSidebar: () => void;
    closeSidebar: () => void;
};

export const useSidebarStore = create<SidebarState>()(set => ({
    isOpen: false,
    toggleSidebar: value => set(state => ({ isOpen: value ?? !state.isOpen })),
    openSidebar: () => set({ isOpen: true }),
    closeSidebar: () => set({ isOpen: false }),
}));
