-- =====================================================================
-- ACTIVAR REALTIME EN app_settings
-- Hijos del Rey M&D - E-commerce
-- =====================================================================
-- INSTRUCCIONES:
--   1. Ve a Supabase Dashboard → tu proyecto
--   2. Ve a "SQL Editor" en la barra lateral
--   3. Crea una nueva consulta y pega este script
--   4. Presiona "Run" (Ctrl+Enter)
--
-- Esto habilita Supabase Realtime en la tabla app_settings para que
-- cuando el admin guarda cambios (Nosotros, Inicio, Contacto),
-- TODOS los navegadores abiertos se actualicen automáticamente.
-- =====================================================================

-- Agregar la tabla app_settings a la publicación de Realtime
-- (si ya está agregada, este comando no hace nada — es seguro ejecutar)
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;

-- Verificar que quedó registrada (deberías ver app_settings en el resultado)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('app_settings', 'orders', 'blog_posts', 'products');
