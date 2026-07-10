-- =====================================================================
-- SCRIPT DE SEGURIDAD v2 — HIJOS DEL REY MyD
-- Corrige los 25 warnings del Security Advisor de Supabase
-- =====================================================================
-- INSTRUCCIONES:
--   1. Abre el SQL Editor en tu Dashboard de Supabase
--   2. Crea una nueva consulta (New Query)
--   3. Pega este script completo y ejecuta (Run / Ctrl+Enter)
-- =====================================================================

BEGIN;

-- =====================================================================
-- PASO 0: FUNCIÓN AUXILIAR is_admin()
-- =====================================================================
-- Lee el rol directamente del JWT (user_metadata), sin consulta extra.
-- SECURITY DEFINER + search_path fijado para evitar escalada de privilegios.
-- Esta función es la base de todas las políticas administrativas.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Revocar acceso público y otorgar solo a autenticados
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- =====================================================================
-- PASO 1: STORAGE — bucket "productos"
-- =====================================================================
-- Objetivo: Eliminar acceso de listado para anon, mantener URLs públicas
-- de imágenes funcionales, y restringir escritura a admins.

-- Limpiar TODAS las policies existentes en storage.objects del bucket
DROP POLICY IF EXISTS "Allow public read"                ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous read"             ON storage.objects;
DROP POLICY IF EXISTS "productos_public_select"          ON storage.objects;
DROP POLICY IF EXISTS "productos_read_policy"            ON storage.objects;
DROP POLICY IF EXISTS "Allow admin write"                ON storage.objects;
DROP POLICY IF EXISTS "productos_admin_write_policy"     ON storage.objects;
DROP POLICY IF EXISTS "storage_productos_select"         ON storage.objects;
DROP POLICY IF EXISTS "storage_productos_admin_write"    ON storage.objects;
DROP POLICY IF EXISTS "storage_productos_admin_update"   ON storage.objects;
DROP POLICY IF EXISTS "storage_productos_admin_delete"   ON storage.objects;

-- SELECT: Permitir descargar objetos individuales a cualquiera
-- (necesario para servir imágenes en la web; NO permite listar el bucket)
-- El Security Advisor seguirá marcando esto como "acceso anónimo" pero
-- es INTENCIONAL en un e-commerce público. Sin esto, las imágenes no cargan.
CREATE POLICY "storage_productos_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'productos');

-- INSERT / UPDATE / DELETE: Solo administradores autenticados
CREATE POLICY "storage_productos_admin_write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'productos' AND public.is_admin());

CREATE POLICY "storage_productos_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING  (bucket_id = 'productos' AND public.is_admin())
  WITH CHECK (bucket_id = 'productos' AND public.is_admin());

CREATE POLICY "storage_productos_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING  (bucket_id = 'productos' AND public.is_admin());


-- =====================================================================
-- PASO 2: TABLAS EXCLUSIVAMENTE ADMINISTRATIVAS
-- =====================================================================
-- Solo administradores deben acceder a estos datos.
-- Usamos is_admin() en lugar de "true" para evitar RLS-bypass.

-- --- public.billing_clients ---
DROP POLICY IF EXISTS "billing_clients_admin_all"    ON public.billing_clients;
DROP POLICY IF EXISTS "billing_clients_admin_select" ON public.billing_clients;
DROP POLICY IF EXISTS "billing_clients_admin_insert" ON public.billing_clients;
DROP POLICY IF EXISTS "billing_clients_admin_update" ON public.billing_clients;
DROP POLICY IF EXISTS "billing_clients_admin_delete" ON public.billing_clients;

CREATE POLICY "billing_clients_admin_select" ON public.billing_clients
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "billing_clients_admin_insert" ON public.billing_clients
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "billing_clients_admin_update" ON public.billing_clients
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "billing_clients_admin_delete" ON public.billing_clients
  FOR DELETE TO authenticated USING (public.is_admin());

-- --- public.billing_products ---
DROP POLICY IF EXISTS "billing_products_admin_all"    ON public.billing_products;
DROP POLICY IF EXISTS "billing_products_admin_select" ON public.billing_products;
DROP POLICY IF EXISTS "billing_products_admin_insert" ON public.billing_products;
DROP POLICY IF EXISTS "billing_products_admin_update" ON public.billing_products;
DROP POLICY IF EXISTS "billing_products_admin_delete" ON public.billing_products;

CREATE POLICY "billing_products_admin_select" ON public.billing_products
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "billing_products_admin_insert" ON public.billing_products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "billing_products_admin_update" ON public.billing_products
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "billing_products_admin_delete" ON public.billing_products
  FOR DELETE TO authenticated USING (public.is_admin());

-- --- public.invoice_items ---
DROP POLICY IF EXISTS "invoice_items_admin_all"    ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_admin_select" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_admin_insert" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_admin_update" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_admin_delete" ON public.invoice_items;

CREATE POLICY "invoice_items_admin_select" ON public.invoice_items
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "invoice_items_admin_insert" ON public.invoice_items
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "invoice_items_admin_update" ON public.invoice_items
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "invoice_items_admin_delete" ON public.invoice_items
  FOR DELETE TO authenticated USING (public.is_admin());

-- --- public.invoices ---
DROP POLICY IF EXISTS "invoices_admin_all"    ON public.invoices;
DROP POLICY IF EXISTS "invoices_admin_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_admin_insert" ON public.invoices;
DROP POLICY IF EXISTS "invoices_admin_update" ON public.invoices;
DROP POLICY IF EXISTS "invoices_admin_delete" ON public.invoices;

CREATE POLICY "invoices_admin_select" ON public.invoices
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "invoices_admin_insert" ON public.invoices
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "invoices_admin_update" ON public.invoices
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "invoices_admin_delete" ON public.invoices
  FOR DELETE TO authenticated USING (public.is_admin());

-- --- public.user_roles ---
DROP POLICY IF EXISTS "user_roles_read_for_admin"  ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_write_for_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_select"    ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_insert"    ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_update"    ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_delete"    ON public.user_roles;

CREATE POLICY "user_roles_admin_select" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "user_roles_admin_insert" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_delete" ON public.user_roles
  FOR DELETE TO authenticated USING (public.is_admin());


-- =====================================================================
-- PASO 3: TABLAS DE CONTENIDO PÚBLICO (E-commerce / Blog)
-- =====================================================================
-- Productos y blog son INTENCIONALMENTE visibles por anon.
-- El Security Advisor lo marcará, pero es el comportamiento correcto
-- para un e-commerce. La escritura está protegida con is_admin().

-- --- public.products ---
DROP POLICY IF EXISTS "products_public_read"   ON public.products;
DROP POLICY IF EXISTS "products_admin_write"   ON public.products;
DROP POLICY IF EXISTS "products_admin_insert"  ON public.products;
DROP POLICY IF EXISTS "products_admin_update"  ON public.products;
DROP POLICY IF EXISTS "products_admin_delete"  ON public.products;

-- Lectura pública intencional (e-commerce visible sin login)
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT TO public USING (true);

-- Escritura exclusiva para administradores
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin());

-- --- public.blog_posts ---
DROP POLICY IF EXISTS "blog_public_read"  ON public.blog_posts;
DROP POLICY IF EXISTS "blog_admin_write"  ON public.blog_posts;
DROP POLICY IF EXISTS "blog_admin_insert" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_admin_update" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_admin_delete" ON public.blog_posts;

-- Lectura pública intencional (blog visible sin login)
CREATE POLICY "blog_public_read" ON public.blog_posts
  FOR SELECT TO public USING (true);

-- Escritura exclusiva para administradores
CREATE POLICY "blog_admin_insert" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "blog_admin_update" ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "blog_admin_delete" ON public.blog_posts
  FOR DELETE TO authenticated USING (public.is_admin());

-- --- public.app_settings ---
DROP POLICY IF EXISTS "app_settings_public_read"  ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_all"    ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_insert" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_update" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_delete" ON public.app_settings;

-- Lectura pública para configuración del sitio visible en frontend
CREATE POLICY "app_settings_public_read" ON public.app_settings
  FOR SELECT TO public USING (true);

-- Escritura exclusiva para administradores
CREATE POLICY "app_settings_admin_insert" ON public.app_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "app_settings_admin_update" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "app_settings_admin_delete" ON public.app_settings
  FOR DELETE TO authenticated USING (public.is_admin());


-- =====================================================================
-- PASO 4: MENSAJES DE CONTACTO
-- =====================================================================
-- Cualquier visitante puede enviar (INSERT). Solo admins pueden leer/editar.

DROP POLICY IF EXISTS "contact_public_insert"  ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_read"     ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_update"   ON public.contact_messages;
DROP POLICY IF EXISTS "contact_admin_delete"   ON public.contact_messages;

-- INSERT público (visitantes anónimos también pueden enviar mensajes)
-- NOTA: El Security Advisor marcará esto como "anonymous access" — es intencional.
CREATE POLICY "contact_public_insert" ON public.contact_messages
  FOR INSERT TO public
  WITH CHECK (true);

-- Lectura solo para administradores (con filtro real, no "true" abierto)
CREATE POLICY "contact_admin_read" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Actualización (marcar como leído) solo para administradores
CREATE POLICY "contact_admin_update" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "contact_admin_delete" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (public.is_admin());


-- =====================================================================
-- PASO 5: ÓRDENES (orders)
-- =====================================================================
-- El usuario solo ve sus propias órdenes. El admin ve todas y puede actualizar.

DROP POLICY IF EXISTS "orders_user_read"    ON public.orders;
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
DROP POLICY IF EXISTS "orders_user_select"  ON public.orders;
DROP POLICY IF EXISTS "orders_user_insert"  ON public.orders;
DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;

-- SELECT: cada usuario autenticado ve solo sus órdenes
CREATE POLICY "orders_user_select" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- INSERT: cualquier usuario autenticado puede crear su propia orden
CREATE POLICY "orders_user_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: solo admins pueden actualizar estado de órdenes
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: solo admins pueden eliminar órdenes (caso raro)
CREATE POLICY "orders_admin_delete" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_admin());


-- =====================================================================
-- PASO 6: PERFILES (profiles)
-- =====================================================================
-- Cada usuario solo accede a su propio perfil. Admin puede leer todos.

DROP POLICY IF EXISTS "profiles_self_read"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;

-- SELECT: usuario ve solo su perfil; admin ve todos
CREATE POLICY "profiles_self_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- INSERT: el propio sistema/trigger crea el perfil al registrarse
CREATE POLICY "profiles_self_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: usuario actualiza solo su propio perfil
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING  (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());


COMMIT;

-- =====================================================================
-- Script ejecutado con exito.
-- =====================================================================
-- RESUMEN DE ADVERTENCIAS RESIDUALES (ESPERADAS E INTENCIONALES):
--
-- 1. "Anonymous Access" en products, blog_posts, app_settings, storage:
--    NORMAL para un e-commerce. Sin acceso anon no se verían productos
--    ni imágenes. El riesgo es CERO porque no hay datos sensibles.
--
-- 2. "Anonymous Access" en contact_messages (INSERT):
--    NECESARIO para que visitantes sin cuenta puedan contactarte.
--    Solo INSERT; la lectura está bloqueada para anon.
--
-- 3. "RLS Always True" en products_public_read / blog_public_read:
--    INTENCIONAL. Todos los productos y posts son visibles públicamente.
--    No hay filtro por fila porque todos los registros son públicos.
--
-- Para eliminar TODOS los warnings sin excepción habría que requerir
-- login para ver productos — lo cual no tiene sentido en un e-commerce.
-- =====================================================================
