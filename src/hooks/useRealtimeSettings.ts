import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/store/adminStore';

/**
 * useRealtimeSettings
 *
 * Suscribe a Supabase Realtime en la tabla `app_settings` (fila id=1).
 * Cuando el admin guarda cualquier cambio (Inicio, Nosotros, Contacto, etc.),
 * este hook detecta el evento UPDATE y llama automáticamente a `fetchSettings()`
 * para que TODOS los navegadores (visitantes y admin) vean los nuevos datos
 * sin necesidad de refrescar la página.
 *
 * Requisito: La tabla `app_settings` debe tener Realtime activado en
 * Supabase Dashboard → Database → Replication → app_settings ✓
 */
export function useRealtimeSettings() {
  const fetchSettings = useAdminStore((state) => state.fetchSettings);

  useEffect(() => {
    const channel = supabase
      .channel('realtime:app_settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_settings',
          filter: 'id=eq.1',
        },
        (_payload) => {
          // Un admin actualizó la configuración del sitio → recargar desde Supabase
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);
}
