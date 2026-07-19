-- =====================================================================
-- CORRECCIÓN DE PERMISOS Y CONFIGURACIÓN REALTIME COMPLETA
-- Hijos del Rey M&D - E-commerce
-- =====================================================================
-- INSTRUCCIONES:
--   1. Ve a Supabase Dashboard (https://supabase.com/dashboard) → tu proyecto
--   2. Ve a "SQL Editor" en la barra lateral izquierda
--   3. Crea una nueva consulta ("New Query")
--   4. Pega este script completo y presiona "Run" (Ctrl+Enter)
-- =====================================================================

-- ── 1. OTORGAR PRIVILEGIOS A LAS TABLAS PRINCIPALES ──────────────────
-- Esto soluciona los errores de "permission denied" permitiendo que la 
-- Anon Key del cliente pueda consultar los datos de la web.

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO postgres, service_role;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.blog_posts TO anon, authenticated;


-- ── 2. CONFIGURAR RLS (ROW LEVEL SECURITY) ──────────────────────────
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública: cualquier visitante puede verlos
DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
CREATE POLICY "app_settings_public_read" ON public.app_settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "blog_public_read" ON public.blog_posts;
CREATE POLICY "blog_public_read" ON public.blog_posts
  FOR SELECT TO public USING (true);


-- ── 3. ACTIVAR REALTIME DE FORMA SEGURA (SIN ERRORES) ────────────────
-- Bloque que agrega las tablas a la publicación de tiempo real solo si 
-- no son miembros aún, evitando el error de "already member of publication"
DO $$
BEGIN
  -- app_settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
  END IF;

  -- products
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;

  -- blog_posts
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'blog_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
  END IF;
END $$;


-- ── 4. VERIFICACIÓN FINAL ────────────────────────────────────────────
-- Devuelve las tablas activas en Realtime (deberían verse todas)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('app_settings', 'products', 'blog_posts');
