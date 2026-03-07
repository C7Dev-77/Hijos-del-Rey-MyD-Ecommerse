import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query'; // If we use it, but they might not invalidate properly. We will just use toast

export function useRealtimeOrders() {
    const { user, isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Suscribirse a cambios en la tabla 'orders' para este usuario
        const channel = supabase
            .channel('custom-user-orders')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newOrder = payload.new;
                    const oldOrder = payload.old;

                    // Si cambió el estado del pedido, avisar al usuario
                    if (newOrder.status !== oldOrder.status) {
                        const shortId = (newOrder.id as string).slice(0, 8).toUpperCase();

                        const statusLabels: Record<string, string> = {
                            pending: 'Pendiente',
                            processing: 'En preparación',
                            shipped: 'En camino',
                            delivered: 'Entregado',
                            cancelled: 'Cancelado',
                        };

                        const label = statusLabels[newOrder.status as string] || newOrder.status;

                        toast.success(`Tu pedido #${shortId} ahora está: ${label}`, {
                            duration: 8000,
                            description: 'Puedes revisar los detalles en tu perfil.',
                            action: {
                                label: 'Ver perfil',
                                onClick: () => window.location.href = '/perfil',
                            },
                        });

                        // Opcional: invalidar queries si se está usando React Query
                        queryClient.invalidateQueries({ queryKey: ['orders'] }).catch(() => { });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, isAuthenticated, queryClient]);
}
