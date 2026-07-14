-- =====================================================================
-- MIGRACIÓN MAESTRA: Inicialización de app_settings y blog_posts
-- Hijos del Rey M&D - E-commerce
-- =====================================================================
-- INSTRUCCIONES DE USO:
--   1. Ve a tu Dashboard de Supabase (https://supabase.com/dashboard)
--   2. Abre el proyecto "tcsljaqcmcadhhspdvco" (Hijos del Rey MyD)
--   3. Ve a la sección "SQL Editor" en la barra lateral izquierda
--   4. Crea una nueva consulta ("New Query")
--   5. Pega este script completo y presiona "Run" (o Ctrl+Enter)
-- =====================================================================

BEGIN;

-- ── 1. TABLA APP_SETTINGS (CONFIGURACIÓN DEL SITIO) ───────────────────

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.app_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  
  -- Store settings
  store_name TEXT DEFAULT 'M&D Hijos del Rey',
  store_description TEXT DEFAULT 'Mobiliario y decoración artesanal en Colombia.',
  logo_url TEXT DEFAULT '/logo.png',
  currency TEXT DEFAULT 'COP',
  tax_rate NUMERIC DEFAULT 19,
  free_shipping_threshold NUMERIC DEFAULT 5000000,
  meta_title TEXT DEFAULT 'M&D Hijos del Rey | Muebles Artesanales',
  meta_description TEXT DEFAULT 'Descubre nuestros diseños exclusivos y muebles hechos a mano en Colombia.',
  shipping_policy TEXT DEFAULT 'Entrega en 5-10 días hábiles. Envío gratuito en pedidos superiores a $1.000.000.',
  return_policy TEXT DEFAULT 'Aceptamos devoluciones dentro de los 7 días siguientes a la entrega. El producto debe estar en su estado original.',
  privacy_policy TEXT DEFAULT 'Tus datos están seguros con nosotros.',
  whatsapp_message TEXT DEFAULT 'Hola, tengo una consulta desde la tienda virtual.',
  checkout_message TEXT DEFAULT 'Procesaremos tu pedido vía WhatsApp para confirmar disponibilidad y envío.',

  -- Home Page Content
  hero_title TEXT DEFAULT 'Amoblar con Calidad y Economía.',
  hero_subtitle TEXT DEFAULT 'Calidad artesanal 100% propia, directo desde Sampués a precios económicos.',
  hero_image TEXT DEFAULT 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920',
  hero_badge_text TEXT DEFAULT '✨ Colección 2026',
  favorites_title TEXT DEFAULT 'Los Favoritos',
  best_sellers_title TEXT DEFAULT 'Más Vendidos',
  new_arrivals_title TEXT DEFAULT 'Recién Llegados',
  designs_title TEXT DEFAULT 'Diseños que Transforman Espacios',
  hero_button1_text TEXT DEFAULT 'Ver Catálogo',
  hero_button2_text TEXT DEFAULT 'Cotizar Ahora',
  about_section_title TEXT DEFAULT 'Artesanía de Excelencia',
  about_section_text TEXT DEFAULT 'Nuestro compromiso es crear piezas únicas que transformen tus espacios. Cada mueble está fabricado con maderas de origen sostenible y mentes creativas.',
  about_section_button_text TEXT DEFAULT 'Conoce Nuestra Historia',
  promos JSONB DEFAULT '[
    {"icon": "🛡️", "text": "Garantía Extendida: Todos nuestros diseños incluyen una Garantía de 2 años contra defectos de fabricación."},
    {"icon": "💳", "text": "Paga a tu Ritmo: Financia tu compra hasta en 12 cuotas sin intereses con Bancolombia."},
    {"icon": "📐", "text": "Diseño a Medida: Servicio de personalización de muebles. ¡Creamos tu visión!"},
    {"icon": "🥇", "text": "Más de 2,500 Clientes Felices en toda Colombia."}
  ]'::jsonb,

  -- Contact Info
  contact_phone TEXT DEFAULT '+57 304 629 7119',
  contact_email TEXT DEFAULT 'info@mydhijosdelrey.com',
  contact_address TEXT DEFAULT 'Barrio 12 de Octubre, Sampués, Sucre, Colombia',
  contact_whatsapp TEXT DEFAULT '+57 324 425 9132',
  contact_schedule TEXT DEFAULT 'Lun - Sáb: 8:00 AM - 6:00 PM',
  social_facebook TEXT DEFAULT 'https://facebook.com/mydhijosdelrey',
  social_instagram TEXT DEFAULT 'https://instagram.com/mydhijosdelrey',
  social_pinterest TEXT DEFAULT 'https://pinterest.com/mydhijosdelrey',

  -- About Page Content
  about_page_content JSONB DEFAULT '{
    "heroTitle": "Nuestra Historia",
    "heroSubtitle": "Más de tres décadas dedicados a crear muebles artesanales que transforman casas en hogares.",
    "heroImage": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920",
    "storyTag": "Quiénes Somos",
    "storyTitle": "Artesanos de Tradición, Creadores del Futuro",
    "storyP1": "En 1990, Manuel y Daniela comenzaron con un sueño: crear muebles que no solo fueran funcionales, sino verdaderas obras de arte que contaran historias y crearan memorias.",
    "storyP2": "Hoy, M&D Hijos del Rey es sinónimo de calidad artesanal en Colombia. Cada pieza que sale de nuestro taller lleva consigo el legado de técnicas tradicionales perfeccionadas durante generaciones.",
    "storyP3": "Nuestro compromiso va más allá de la madera: trabajamos con proveedores certificados, utilizamos materiales sostenibles y garantizamos condiciones justas para todos nuestros artesanos.",
    "storyImage": "https://images.unsplash.com/photo-1452457750107-cd084dce177d?w=800",
    "storyBadgeNumber": "30+",
    "storyBadgeText": "Años de Experiencia",
    "timelineTag": "Nuestra Trayectoria",
    "timelineTitle": "Hitos que Nos Definen",
    "timeline": [
      { "year": "1990", "title": "El Comienzo", "description": "Manuel y Daniela fundaron un pequeño taller de carpintería con la visión de crear muebles que trascendieran generaciones." },
      { "year": "2000", "title": "Expansión", "description": "Abrimos nuestra primera sala de exhibición y formamos un equipo de 15 artesanos especializados." },
      { "year": "2010", "title": "Reconocimiento", "description": "Recibimos el Premio Nacional de Artesanía por nuestra contribución a preservar técnicas tradicionales." },
      { "year": "2020", "title": "Transformación Digital", "description": "Lanzamos nuestra plataforma digital sin perder la esencia artesanal que nos caracteriza." },
      { "year": "Hoy", "title": "Líderes en Artesanía", "description": "Más de 10 años creando piezas únicas para miles de hogares colombianos." }
    ],
    "valuesTitle": "Nuestros Valores",
    "values": [
      { "icon": "Heart", "title": "Pasión por el Detalle", "description": "Cada pieza recibe la dedicación y el amor que merece." },
      { "icon": "Users", "title": "Herencia Familiar", "description": "Transmitimos conocimientos de generación en generación." },
      { "icon": "Award", "title": "Calidad Superior", "description": "Solo utilizamos los mejores materiales and técnicas." },
      { "icon": "Leaf", "title": "Sostenibilidad", "description": "Comprometidos con el medio ambiente y la comunidad." }
    ],
    "teamTag": "Nuestro Equipo",
    "teamTitle": "Los Artesanos Detrás de la Magia",
    "teamSubtitle": "Toca cada tarjeta para conocer más sobre nuestros artesanos",
    "team": [
      { "id": "1", "name": "Manuel Rodríguez", "role": "Fundador & Maestro Ebanista", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", "bio": "Con más de 40 años de experiencia en ebanistería, Manuel es el alma de M&D. Su pasión por la madera comenzó a los 12 años en el taller de su abuelo." },
      { "id": "2", "name": "Daniela Martínez", "role": "Co-Fundadora & Directora de Diseño", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", "bio": "Arquitecta de formación, Daniela aporta la visión estética moderna a nuestros diseños tradicionales." },
      { "id": "3", "name": "Carlos Herrera", "role": "Maestro Carpintero Senior", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", "bio": "Carlos lleva 25 años perfeccionando el arte de la carpintería fina. Especialista en técnicas de ensamblaje tradicional." },
      { "id": "4", "name": "Ana Lucía Gómez", "role": "Especialista en Tapicería", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", "bio": "Ana Lucía transformó su pasión por los textiles en una maestría en tapicería de alta gama." }
    ]
  }'::jsonb,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Asegurar que sólo se pueda tener un registro (con ID 1) en esta tabla
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'app_settings' AND constraint_name = 'app_settings_single_row'
  ) THEN
    ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_single_row CHECK (id = 1);
  END IF;
END $$;

-- Agregar dinámicamente columnas faltantes por si la tabla ya existía
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS store_name TEXT DEFAULT 'M&D Hijos del Rey';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS store_description TEXT DEFAULT 'Mobiliario y decoración artesanal en Colombia.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/logo.png';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'COP';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 19;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC DEFAULT 5000000;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT 'M&D Hijos del Rey | Muebles Artesanales';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT 'Descubre nuestros diseños exclusivos y muebles hechos a mano en Colombia.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS shipping_policy TEXT DEFAULT 'Entrega en 5-10 días hábiles. Envío gratuito en pedidos superiores a $1.000.000.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS return_policy TEXT DEFAULT 'Aceptamos devoluciones dentro de los 7 días siguientes a la entrega. El producto debe estar en su estado original.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS privacy_policy TEXT DEFAULT 'Tus datos están seguros con nosotros.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT 'Hola, tengo una consulta desde la tienda virtual.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS checkout_message TEXT DEFAULT 'Procesaremos tu pedido vía WhatsApp para confirmar disponibilidad y envío.';

-- Columnas de Inicio
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'Amoblar con Calidad y Economía.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Calidad artesanal 100% propia, directo desde Sampués a precios económicos.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS hero_image TEXT DEFAULT 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS hero_badge_text TEXT DEFAULT '✨ Colección 2026';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS favorites_title TEXT DEFAULT 'Los Favoritos';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS best_sellers_title TEXT DEFAULT 'Más Vendidos';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS new_arrivals_title TEXT DEFAULT 'Recién Llegados';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS designs_title TEXT DEFAULT 'Diseños que Transforman Espacios';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS hero_button1_text TEXT DEFAULT 'Ver Catálogo';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS hero_button2_text TEXT DEFAULT 'Cotizar Ahora';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS about_section_title TEXT DEFAULT 'Artesanía de Excelencia';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS about_section_text TEXT DEFAULT 'Nuestro compromiso es crear piezas únicas que transformen tus espacios. Cada mueble está fabricado con maderas de origen sostenible y mentes creativas.';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS about_section_button_text TEXT DEFAULT 'Conoce Nuestra Historia';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS promos JSONB DEFAULT NULL;

-- Columnas de Contacto
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '+57 304 629 7119';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'info@mydhijosdelrey.com';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS contact_address TEXT DEFAULT 'Barrio 12 de Octubre, Sampués, Sucre, Colombia';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT DEFAULT '+57 324 425 9132';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS contact_schedule TEXT DEFAULT 'Lun - Sáb: 8:00 AM - 6:00 PM';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS social_facebook TEXT DEFAULT 'https://facebook.com/mydhijosdelrey';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS social_instagram TEXT DEFAULT 'https://instagram.com/mydhijosdelrey';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS social_pinterest TEXT DEFAULT 'https://pinterest.com/mydhijosdelrey';

-- Columnas de Nosotros
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS about_page_content JSONB DEFAULT NULL;

-- Insertar fila inicial si no existe
INSERT INTO public.app_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Configurar Row Level Security (RLS) para app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
CREATE POLICY "app_settings_public_read" ON public.app_settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "app_settings_admin_insert" ON public.app_settings;
CREATE POLICY "app_settings_admin_insert" ON public.app_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "app_settings_admin_update" ON public.app_settings;
CREATE POLICY "app_settings_admin_update" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "app_settings_admin_delete" ON public.app_settings;
CREATE POLICY "app_settings_admin_delete" ON public.app_settings
  FOR DELETE TO authenticated USING (public.is_admin());


-- ── 2. TABLA BLOG_POSTS (ARTÍCULOS DEL BLOG) ─────────────────────────

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  author TEXT NOT NULL,
  author_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Configurar Row Level Security (RLS) para blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_public_read" ON public.blog_posts;
CREATE POLICY "blog_public_read" ON public.blog_posts
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "blog_admin_insert" ON public.blog_posts;
CREATE POLICY "blog_admin_insert" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "blog_admin_update" ON public.blog_posts;
CREATE POLICY "blog_admin_update" ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "blog_admin_delete" ON public.blog_posts;
CREATE POLICY "blog_admin_delete" ON public.blog_posts
  FOR DELETE TO authenticated USING (public.is_admin());

COMMIT;
