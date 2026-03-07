-- =====================================================
-- ACTUALIZAR DATOS REALES DE LA TIENDA EN SUPABASE
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- =====================================================

UPDATE app_settings SET
  contact_phone      = '+57 304 629 7119',
  contact_email      = 'info@mydhijosdelrey.com',
  contact_address    = 'Barrio 12 de Octubre, Sampués, Sucre, Colombia',
  contact_whatsapp   = '+57 324 425 9132',
  contact_schedule   = 'Lun - Sáb: 8:00 AM - 6:00 PM',
  logo_url           = '/logo.png',
  store_name         = 'M&D Hijos del Rey',
  updated_at         = NOW()
WHERE id = 1;

-- Verificar que se actualizó correctamente
SELECT contact_phone, contact_address, contact_whatsapp, contact_schedule 
FROM app_settings WHERE id = 1;
