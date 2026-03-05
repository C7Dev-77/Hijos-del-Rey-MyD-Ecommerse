import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  // Acciones
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,

  /**
   * Inicializa el estado de auth escuchando los cambios de sesión de Supabase.
   * Llamar desde main.tsx o App.tsx una sola vez al inicio.
   */
  initialize: async () => {
    // 1. Obtener la sesión actual
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Verificar si es admin consultando los metadatos del usuario
      const isAdmin = session.user.user_metadata?.role === 'admin';
      set({
        user: session.user,
        session,
        isAuthenticated: true,
        isAdmin,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }

    // 2. Escuchar cambios futuros de sesión (login, logout, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const isAdmin = session.user.user_metadata?.role === 'admin';
        set({
          user: session.user,
          session,
          isAuthenticated: true,
          isAdmin,
        });
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isAdmin: false,
        });

        // Limpiar estado local en modo deslogueado
        import('./cartStore').then(m => m.useCartStore.getState().clearCart());
        import('./wishlistStore').then(m => m.useWishlistStore.getState().clearWishlist());
      }
    });
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: 'Credenciales incorrectas. Verifica tu email y contraseña.' };
    }

    const isAdmin = data.user?.user_metadata?.role === 'admin';
    set({
      user: data.user,
      session: data.session,
      isAuthenticated: true,
      isAdmin,
    });

    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();

    // Al limpiar la sesión, también vaciamos carritos y favoritos
    const { useCartStore } = await import('./cartStore');
    const { useWishlistStore } = await import('./wishlistStore');
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();

    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  register: async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'customer',
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'El correo ya está registrado.' };
      }
      if (error.status === 429 || error.message.includes('rate limit')) {
        return { success: false, error: 'Se han creado muchas cuentas recientemente. Por favor, intenta de nuevo en una hora o desactiva la confirmación de email en Supabase.' };
      }
      return { success: false, error: 'Hubo un error al crear la cuenta. Intente de nuevo.' };
    }

    if (data.user) {
      set({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.session,
        isAdmin: false,
      });
    }

    return { success: true };
  },
}));
