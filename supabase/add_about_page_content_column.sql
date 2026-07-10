-- =====================================================================
-- MIGRACIÓN: Agregar columna about_page_content a app_settings
-- =====================================================================
-- INSTRUCCIONES:
--   1. Abre el SQL Editor en tu Dashboard de Supabase
--   2. Crea una nueva consulta (New Query)
--   3. Pega este script y ejecuta (Run)
-- =====================================================================

-- Agregar columna JSONB para guardar el contenido completo de la página Nosotros
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS about_page_content JSONB DEFAULT NULL;

-- Verificar que se añadió correctamente
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'app_settings'
  AND column_name = 'about_page_content';
