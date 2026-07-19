-- =====================================================================
-- CORRECCIÓN DE PERMISOS Y ACTIVACIÓN DE REALTIME EN app_settings
-- Hijos del Rey M&D - E-commerce
-- =====================================================================
-- INSTRUCCIONES:
--   1. Ve a Supabase Dashboard (https://supabase.com/dashboard) → tu proyecto
--   2. Ve a "SQL Editor" en la barra lateral izquierda
--   3. Crea una nueva consulta ("New Query")
--   4. Pega este script completo y presiona "Run" (Ctrl+Enter)
-- =====================================================================

-- ── 1. OTORGAR PRIVILEGIOS DE POSTGRES A LA TABLA ────────────────────
-- Esto soluciona el error de "permission denied for table app_settings"
-- permitiendo que la Anon Key del cliente pueda consultar los datos.
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO postgres, service_role;

-- ── 2. CONFIGURAR RLS (ROW LEVEL SECURITY) ──────────────────────────
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública: cualquier visitante puede leer la configuración
DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
CREATE POLICY "app_settings_public_read" ON public.app_settings
  FOR SELECT TO public USING (true);

-- Política de actualización: sólo usuarios autenticados administradores
DROP POLICY IF EXISTS "app_settings_admin_update" ON public.app_settings;
CREATE POLICY "app_settings_admin_update" ON public.app_settings
  FOR UPDATE TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

-- ── 3. ACTIVAR REALTIME ──────────────────────────────────────────────
-- Permite la sincronización instantánea entre navegadores
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;

-- ── 4. VERIFICACIÓN FINAL ────────────────────────────────────────────
-- Devuelve las tablas activas en Realtime (debe aparecer app_settings)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'app_settings';
