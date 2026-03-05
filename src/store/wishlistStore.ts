import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/data/mock';
import { useAuthStore } from './authStore';
import { toast } from 'sonner';

interface WishlistState {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) {
                    toast.error("Para poder guardar en favoritos, inicia sesión o regístrate", { duration: 4000 });
                    return;
                }

                const { items } = get();
                if (items.some((item) => item.id === product.id)) {
                    toast.info("Este producto ya está en tu lista de deseos");
                    return;
                }
                set({ items: [...items, product] });
                toast.success("Producto añadido a favoritos");
            },
            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                }));
                toast.success("Producto eliminado de favoritos");
            },
            isInWishlist: (productId) => {
                return get().items.some((item) => item.id === productId);
            },
            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
