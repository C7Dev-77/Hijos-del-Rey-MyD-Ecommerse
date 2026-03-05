import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchQuery: string;
  activeFilters: {
    categories: string[];
    priceRange: [number, number];
    inStock: boolean;
  };
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: Partial<UIState['activeFilters']>) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  categories: [],
  priceRange: [0, 10000000] as [number, number],
  inStock: false,
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      mobileMenuOpen: false,
      searchQuery: '',
      activeFilters: defaultFilters,

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      
      setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
      toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),
      
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      setActiveFilters: (filters: Partial<UIState['activeFilters']>) =>
        set({ activeFilters: { ...get().activeFilters, ...filters } }),
      
      resetFilters: () => set({ activeFilters: defaultFilters }),
    }),
    {
      name: 'myd-ui-storage',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
);
