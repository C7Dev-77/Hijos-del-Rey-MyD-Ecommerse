-- 6. TABLA DE CONFIGURACIÓN GLOBAL
-- =====================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id INT PRIMARY KEY CHECK (id = 1), -- Singleton pattern
  store_name TEXT DEFAULT 'M&D Hijos del Rey',
  store_description TEXT DEFAULT 'Mobiliario y decoración artesanal en Colombia.',
  logo_url TEXT DEFAULT '/logo.png',
  currency TEXT DEFAULT 'COP',
  tax_rate NUMERIC DEFAULT 19,
  free_shipping_threshold NUMERIC DEFAULT 5000000,
  meta_title TEXT DEFAULT 'M&D Hijos del Rey | Muebles Artesanales',
  meta_description TEXT DEFAULT 'Descubre nuestros diseños exclusivos y muebles hechos a mano en Colombia.',
  shipping_policy TEXT DEFAULT 'Envíos a nivel nacional en Colombia con tiempos de entrega de 5 a 10 días hábiles.',
  return_policy TEXT DEFAULT 'Se aceptan devoluciones dentro de los 15 días posteriores a la entrega.',
  privacy_policy TEXT DEFAULT 'Tus datos están seguros con nosotros.',
  
  -- Home page content
  hero_title TEXT DEFAULT 'Muebles que Cuentan Historias',
  hero_subtitle TEXT DEFAULT 'Artesanía colombiana en cada detalle',
  hero_image TEXT DEFAULT 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920',
  hero_badge_text TEXT DEFAULT '✨ Nuevos diseños 2025',
  favorites_title TEXT DEFAULT 'Los Favoritos',
  best_sellers_title TEXT DEFAULT 'Más Vendidos',
  new_arrivals_title TEXT DEFAULT 'Recién Llegados',
  designs_title TEXT DEFAULT 'Diseños que Transforman Espacios',

  -- Contact info
  contact_phone TEXT DEFAULT '+57 601 234 5678',
  contact_email TEXT DEFAULT 'info@mydhijosdelrey.com',
  contact_address TEXT DEFAULT 'Calle 85 #15-30, Bogotá, Colombia',
  contact_whatsapp TEXT DEFAULT '+57 300 123 4567',
  contact_schedule TEXT DEFAULT 'Lun - Sáb: 9:00 AM - 7:00 PM',
  social_facebook TEXT DEFAULT 'https://facebook.com/mydhijosdelrey',
  social_instagram TEXT DEFAULT 'https://instagram.com/mydhijosdelrey',
  social_pinterest TEXT DEFAULT 'https://pinterest.com/mydhijosdelrey',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar la única fila por defecto si no existe
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Todo el mundo puede leer la configuración de la tienda
CREATE POLICY "settings_public_read" ON app_settings FOR SELECT USING (TRUE);

-- Solo el admin puede modificar
CREATE POLICY "settings_admin_update" ON app_settings 
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_app_settings_updated_at ON app_settings;
CREATE TRIGGER set_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
