-- =====================================================
-- M&D HIJOS DEL REY - Script de Base de Datos Supabase
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- =====================================================

-- 1. TABLA DE PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  price         INTEGER NOT NULL,
  original_price INTEGER,
  discount      INTEGER,
  stock         INTEGER NOT NULL DEFAULT 0,
  category      TEXT NOT NULL,
  subcategory   TEXT,
  description   TEXT NOT NULL,
  short_description TEXT NOT NULL,
  images        TEXT[] DEFAULT '{}',
  dimensions    JSONB DEFAULT '{"width":0,"height":0,"depth":0}',
  materials     TEXT[] DEFAULT '{}',
  colors        TEXT[],
  featured      BOOLEAN DEFAULT FALSE,
  best_seller   BOOLEAN DEFAULT FALSE,
  new_arrival   BOOLEAN DEFAULT FALSE,
  technical_details TEXT,
  shipping_info TEXT,
  returns_info  TEXT,
  rating        NUMERIC(3,1) DEFAULT 4.5,
  review_count  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(best_seller) WHERE best_seller = TRUE;

-- Row Level Security (permite lectura pública, escritura solo a admins)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (TRUE);

CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );


-- 2. TABLA DE BLOG POSTS
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  excerpt      TEXT NOT NULL,
  content      TEXT NOT NULL,
  image        TEXT NOT NULL,
  author       TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  category     TEXT NOT NULL,
  tags         TEXT[] DEFAULT '{}',
  read_time    INTEGER DEFAULT 3,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_public_read" ON blog_posts
  FOR SELECT USING (TRUE);

CREATE POLICY "blog_admin_write" ON blog_posts
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );


-- 3. TABLA DE PEDIDOS
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  products         JSONB NOT NULL DEFAULT '[]',
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  total            INTEGER NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method   TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Usuarios ven solo sus pedidos; admins ven todos
CREATE POLICY "orders_user_read" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "orders_user_insert" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );


-- 4. TABLA DE MENSAJES DE CONTACTO
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar mensajes (formulario de contacto)
CREATE POLICY "contact_public_insert" ON contact_messages
  FOR INSERT WITH CHECK (TRUE);

-- Solo admins pueden leer
CREATE POLICY "contact_admin_read" ON contact_messages
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "contact_admin_update" ON contact_messages
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );


-- 5. FUNCIÓN: actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- INSTRUCCIONES PARA CREAR EL USUARIO ADMIN
-- =====================================================
-- 
-- 1. Ve a Authentication > Users en tu dashboard de Supabase
-- 2. Crea un usuario con:
--    Email: admin@mydhijosdelrey.com (o el que prefieras)
--    Password: (elige una contraseña segura)
--
-- 3. Luego ejecuta este SQL para darle el rol admin:
--
--    UPDATE auth.users
--    SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
--    WHERE email = 'admin@mydhijosdelrey.com';
--
-- =====================================================
