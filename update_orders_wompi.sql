-- MIGRACIÓN: ACTUALIZAR TABLA ORDERS PARA WOMPI
-- =====================================================

-- 1. Agregar columna de referencia única para pagos
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reference TEXT UNIQUE;

-- 2. Asegurar que el estado acepte los valores de Wompi (opcional si es texto libre)
-- Si 'status' es un enum, habría que actualizarlo, pero en Supabase suele ser TEXT por simplicidad.

-- 3. Crear índice para búsquedas rápidas por referencia
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);

-- 4. Actualizar políticas si es necesario (ya deberían permitir inserción a autenticados)
-- Pero por si acaso, aseguramos que el usuario pueda ver su propia orden por referencia
CREATE POLICY "users_select_by_reference" ON orders
  FOR SELECT USING (auth.uid() = user_id OR reference IS NOT NULL);
  -- Nota: El admin ya tiene acceso total si configuramos las políticas previas correctamente.
