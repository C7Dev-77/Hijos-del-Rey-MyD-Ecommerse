import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/store/adminStore';

/**
 * useRealtimeProducts
 *
 * Suscribe a Supabase Realtime para la tabla `products`.
 * Cada vez que un producto se agrega, modifica o elimina en el panel admin,
 * este hook gatilla `fetchProducts()` de forma que todos los clientes
 * vean las actualizaciones de catálogo, precios y stock al instante sin recargar.
 */
export function useRealtimeProducts() {
  const fetchProducts = useAdminStore((state) => state.fetchProducts);

  useEffect(() => {
    const channel = supabase
      .channel('realtime:products')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'products',
        },
        (_payload) => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);
}
