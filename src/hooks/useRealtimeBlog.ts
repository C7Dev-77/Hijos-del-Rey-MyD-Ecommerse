import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/store/adminStore';

/**
 * useRealtimeBlog
 *
 * Suscribe a Supabase Realtime para la tabla `blog_posts`.
 * Cada vez que se crea, edita o elimina un post del blog,
 * este hook gatilla `fetchBlogPosts()` para refrescar el blog en tiempo real.
 */
export function useRealtimeBlog() {
  const fetchBlogPosts = useAdminStore((state) => state.fetchBlogPosts);

  useEffect(() => {
    const channel = supabase
      .channel('realtime:blog_posts')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'blog_posts',
        },
        (_payload) => {
          fetchBlogPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBlogPosts]);
}
