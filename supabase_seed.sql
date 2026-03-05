-- =====================================================
-- M&D HIJOS DEL REY - SEMILLA DE DATOS (SEED)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS del schema
-- =====================================================

-- ─── PRODUCTOS (20) ─────────────────────────────────

INSERT INTO products (id, name, slug, price, original_price, discount, stock, category, description, short_description, images, dimensions, materials, colors, featured, best_seller, new_arrival, rating, review_count, created_at) VALUES

('1', 'Sofá Modular Artesanal', 'sofa-modular-artesanal', 3500000, 4200000, 17, 5, 'sala',
 'Sofá modular de 3 puestos elaborado a mano con madera de roble colombiano y tapizado en tela premium importada. Cada pieza es única, reflejando el trabajo artesanal de nuestros maestros carpinteros con más de 30 años de experiencia. El diseño ergonómico garantiza máximo confort para reuniones familiares o momentos de descanso.',
 'Sofá modular de 3 puestos en roble colombiano',
 ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800','https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=800'],
 '{"width":220,"height":85,"depth":95}',
 ARRAY['Roble Colombiano','Tela Premium','Espuma Alta Densidad'],
 ARRAY['Beige','Gris','Verde Oliva'],
 TRUE, TRUE, FALSE, 4.8, 124, '2024-01-15'),

('2', 'Mesa de Centro Rústica', 'mesa-centro-rustica', 1200000, NULL, NULL, 8, 'sala',
 'Mesa de centro fabricada en madera de pino envejecido con acabado natural que resalta las vetas naturales de la madera. Base de hierro forjado a mano con diseño industrial moderno.',
 'Mesa de centro en pino envejecido',
 ARRAY['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800','https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800'],
 '{"width":120,"height":45,"depth":60}',
 ARRAY['Pino Envejecido','Hierro Forjado'],
 NULL,
 TRUE, FALSE, FALSE, 4.6, 89, '2024-02-10'),

('3', 'Comedor Colonial 6 Puestos', 'comedor-colonial-6-puestos', 4800000, 5500000, 13, 3, 'comedor',
 'Juego de comedor colonial de 6 puestos en cedro macizo. Mesa con extensión central y sillas tapizadas en cuero sintético de alta durabilidad. Acabado en nogal oscuro con detalles tallados a mano.',
 'Comedor colonial en cedro macizo',
 ARRAY['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800','https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800','https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800'],
 '{"width":180,"height":76,"depth":90}',
 ARRAY['Cedro Macizo','Cuero Sintético'],
 NULL,
 FALSE, TRUE, FALSE, 4.9, 156, '2024-01-20'),

('4', 'Cama King Flotante', 'cama-king-flotante', 3200000, NULL, NULL, 4, 'alcobas',
 'Cama king size con diseño flotante que crea una ilusión visual elegante. Cabecero tapizado y estructura en MDF con acabado en roble blanqueado. Incluye LED perimetral para ambiente nocturno.',
 'Cama king con diseño flotante y LED',
 ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
 '{"width":200,"height":120,"depth":220}',
 ARRAY['MDF Premium','Tela Tapiz','LED'],
 NULL,
 TRUE, FALSE, TRUE, 4.7, 78, '2024-03-01'),

('5', 'Biblioteca Modular Industrial', 'biblioteca-modular-industrial', 2100000, NULL, NULL, 6, 'decoracion',
 'Sistema de biblioteca modular con estructura de tubería de hierro negro y estantes de madera recuperada. Diseño industrial perfecto para espacios modernos. Incluye 5 niveles ajustables.',
 'Biblioteca industrial con madera recuperada',
 ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800','https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800'],
 '{"width":150,"height":200,"depth":35}',
 ARRAY['Madera Recuperada','Hierro Negro'],
 NULL,
 FALSE, FALSE, FALSE, 4.5, 62, '2024-02-15'),

('6', 'Sillón Reclinable Ejecutivo', 'sillon-reclinable-ejecutivo', 1800000, NULL, NULL, 10, 'sala',
 'Sillón reclinable con sistema de palanca suave. Tapizado en cuero genuino color cognac. Base giratoria de madera de nogal. Ideal para espacios de lectura o home office.',
 'Sillón reclinable en cuero genuino',
 ARRAY['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'],
 '{"width":85,"height":105,"depth":90}',
 ARRAY['Cuero Genuino','Madera de Nogal'],
 NULL,
 FALSE, TRUE, FALSE, 4.8, 143, '2024-01-05'),

('7', 'Mesa de Noche Art Decó', 'mesa-noche-art-deco', 650000, NULL, NULL, 15, 'alcobas',
 'Mesa de noche con diseño Art Decó. Acabado en laca blanca con detalles dorados. Dos cajones con rieles de cierre suave. Perfecta para complementar habitaciones elegantes.',
 'Mesa de noche con acabado Art Decó',
 ARRAY['https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800'],
 '{"width":50,"height":60,"depth":40}',
 ARRAY['MDF Lacado','Herrajes Dorados'],
 NULL,
 FALSE, FALSE, TRUE, 4.4, 34, '2024-03-10'),

('8', 'Aparador Vintage', 'aparador-vintage', 2800000, 3200000, 12, 2, 'comedor',
 'Aparador vintage de los años 60 restaurado con amor. Puertas corredizas con vidrio esmerilado y amplio espacio de almacenamiento. Patas cónicas en madera de teca.',
 'Aparador vintage restaurado',
 ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'],
 '{"width":180,"height":85,"depth":45}',
 ARRAY['Teca','Vidrio Esmerilado'],
 NULL,
 TRUE, FALSE, FALSE, 4.9, 28, '2024-02-20'),

('9', 'Espejo Sol Dorado', 'espejo-sol-dorado', 450000, NULL, NULL, 20, 'decoracion',
 'Espejo decorativo con marco en forma de sol. Acabado en pan de oro envejecido. Diámetro total de 80cm. Pieza statement para cualquier espacio.',
 'Espejo decorativo con marco dorado',
 ARRAY['https://images.unsplash.com/photo-1618220179428-22790b461013?w=800'],
 '{"width":80,"height":80,"depth":5}',
 ARRAY['Resina','Pan de Oro','Espejo'],
 NULL,
 FALSE, TRUE, FALSE, 4.6, 95, '2024-01-25'),

('10', 'Sillas Comedor Escandinavas (x4)', 'sillas-comedor-escandinavas', 1600000, NULL, NULL, 8, 'comedor',
 'Set de 4 sillas de comedor estilo escandinavo. Asiento moldeado ergonómico y patas de haya natural. Disponible en blanco, negro y gris.',
 'Set de 4 sillas estilo escandinavo',
 ARRAY['https://images.unsplash.com/photo-1503602642458-232111445657?w=800','https://images.unsplash.com/photo-1551298370-9d3d53f2478a?w=800'],
 '{"width":45,"height":82,"depth":52}',
 ARRAY['Polipropileno','Haya Natural'],
 ARRAY['Blanco','Negro','Gris'],
 FALSE, FALSE, FALSE, 4.7, 112, '2024-02-05'),

('11', 'Lámpara Colgante Ratán', 'lampara-colgante-ratan', 380000, NULL, NULL, 12, 'decoracion',
 'Lámpara colgante tejida a mano en ratán natural. Proyecta hermosas sombras geométricas. Cable ajustable hasta 1.5m. Bombillo no incluido.',
 'Lámpara de ratán tejida a mano',
 ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
 '{"width":45,"height":35,"depth":45}',
 ARRAY['Ratán Natural','Cable Textil'],
 NULL,
 FALSE, FALSE, TRUE, 4.5, 47, '2024-03-05'),

('12', 'Cómoda 6 Cajones Roble', 'comoda-6-cajones-roble', 2400000, NULL, NULL, 5, 'alcobas',
 'Cómoda de 6 cajones en roble macizo con acabado natural. Tiradores de cuero genuino. Cajones con guías de extensión total para mayor practicidad.',
 'Cómoda en roble macizo con 6 cajones',
 ARRAY['https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800'],
 '{"width":140,"height":90,"depth":50}',
 ARRAY['Roble Macizo','Cuero Genuino'],
 NULL,
 FALSE, FALSE, FALSE, 4.8, 67, '2024-01-30'),

('13', 'Banco de Entrada Tapizado', 'banco-entrada-tapizado', 890000, NULL, NULL, 7, 'sala',
 'Banco para entrada o pie de cama. Base de metal dorado cepillado y asiento tapizado en terciopelo. Disponible en verde esmeralda, azul marino y rosa palo.',
 'Banco tapizado con base dorada',
 ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
 '{"width":110,"height":48,"depth":40}',
 ARRAY['Metal Dorado','Terciopelo'],
 ARRAY['Verde Esmeralda','Azul Marino','Rosa Palo'],
 FALSE, FALSE, TRUE, 4.6, 38, '2024-03-08'),

('14', 'Escritorio Ejecutivo', 'escritorio-ejecutivo', 2900000, NULL, NULL, 4, 'decoracion',
 'Escritorio ejecutivo de líneas limpias. Superficie en nogal americano con base de acero inoxidable. Incluye pasacables integrado y cajón discreto.',
 'Escritorio en nogal americano',
 ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
 '{"width":160,"height":75,"depth":70}',
 ARRAY['Nogal Americano','Acero Inoxidable'],
 NULL,
 TRUE, FALSE, FALSE, 4.9, 54, '2024-02-12'),

('15', 'Sofá Cama Convertible', 'sofa-cama-convertible', 2600000, NULL, NULL, 6, 'sala',
 'Sofá de 2 puestos que se convierte en cama doble en segundos. Sistema de apertura tipo clic-clac. Ideal para espacios pequeños o habitaciones de huéspedes.',
 'Sofá convertible en cama doble',
 ARRAY['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800'],
 '{"width":180,"height":85,"depth":95}',
 ARRAY['Tela Antimanchas','Espuma HR'],
 ARRAY['Gris Oscuro','Beige','Azul Petróleo'],
 FALSE, FALSE, FALSE, 4.4, 86, '2024-01-18'),

('16', 'Tocador con Espejo LED', 'tocador-espejo-led', 1950000, NULL, NULL, 5, 'alcobas',
 'Tocador moderno con espejo iluminado LED. 3 cajones de almacenamiento y superficie amplia. Acabado en blanco mate con detalles en oro rosa.',
 'Tocador con iluminación LED integrada',
 ARRAY['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800'],
 '{"width":100,"height":140,"depth":45}',
 ARRAY['MDF Lacado','Espejo LED','Herrajes Oro Rosa'],
 NULL,
 FALSE, FALSE, TRUE, 4.7, 42, '2024-03-12'),

('17', 'Macetero Alto Fibra', 'macetero-alto-fibra', 320000, NULL, NULL, 25, 'decoracion',
 'Macetero alto de fibra de vidrio con acabado texturizado. Resistente a interiores y exteriores. Drenaje incluido. Altura ideal para plantas grandes.',
 'Macetero de fibra para interiores/exteriores',
 ARRAY['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'],
 '{"width":35,"height":80,"depth":35}',
 ARRAY['Fibra de Vidrio'],
 ARRAY['Blanco','Negro','Terracota'],
 FALSE, FALSE, FALSE, 4.3, 73, '2024-02-08'),

('18', 'Mesa Auxiliar Mármol', 'mesa-auxiliar-marmol', 750000, NULL, NULL, 9, 'sala',
 'Mesa auxiliar con superficie de mármol Carrara genuino y base de hierro pintado en negro mate. Cada pieza tiene vetas únicas.',
 'Mesa auxiliar con tope de mármol',
 ARRAY['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800'],
 '{"width":40,"height":55,"depth":40}',
 ARRAY['Mármol Carrara','Hierro'],
 NULL,
 FALSE, TRUE, FALSE, 4.8, 91, '2024-01-22'),

('19', 'Cabecero Capitoné', 'cabecero-capitone', 1100000, NULL, NULL, 8, 'alcobas',
 'Cabecero tapizado estilo capitoné clásico. Disponible para camas de 140, 160 y 200cm. Terciopelo de alta calidad resistente al desgaste.',
 'Cabecero tapizado estilo capitoné',
 ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
 '{"width":160,"height":120,"depth":10}',
 ARRAY['Terciopelo','Espuma','MDF'],
 ARRAY['Gris','Beige','Verde Bosque'],
 FALSE, FALSE, FALSE, 4.6, 58, '2024-02-18'),

('20', 'Perchero Árbol Madera', 'perchero-arbol-madera', 420000, NULL, NULL, 14, 'decoracion',
 'Perchero con forma de árbol estilizado. Fabricado en madera de haya con acabado natural. 8 ganchos en diferentes alturas. Base con contrapeso para estabilidad.',
 'Perchero decorativo en forma de árbol',
 ARRAY['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800'],
 '{"width":45,"height":175,"depth":45}',
 ARRAY['Haya Natural'],
 NULL,
 FALSE, FALSE, FALSE, 4.5, 82, '2024-01-12'),

('21', 'Juego Sala Sol', 'juego-sala-sol', 3500000, NULL, NULL, 5, 'sala', 'Juego Sala Sol diseñado para aportar personalidad y comodidad al hogar.', 'Juego Sala Sol - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('22', 'Juego Sala Palma', 'juego-sala-palma', 3500000, NULL, NULL, 5, 'sala', 'Juego Sala Palma diseñado para aportar personalidad y comodidad al hogar.', 'Juego Sala Palma - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('23', 'Sala Shell Rayado', 'sala-shell-rayado', 3500000, NULL, NULL, 5, 'sala', 'Sala Shell Rayado diseñado para aportar personalidad y comodidad al hogar.', 'Sala Shell Rayado - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('24', 'Sofá Arabia', 'sofa-arabia', 3500000, NULL, NULL, 5, 'sala', 'Sofá Arabia diseñado para aportar personalidad y comodidad al hogar.', 'Sofá Arabia - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('25', 'Sofá Seccional en L', 'sofa-seccional-en-l', 3500000, NULL, NULL, 5, 'sala', 'Sofá Seccional en L diseñado para aportar personalidad y comodidad al hogar.', 'Sofá Seccional en L - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('26', 'Sofá Belgrado', 'sofa-belgrado', 3500000, NULL, NULL, 5, 'sala', 'Sofá Belgrado diseñado para aportar personalidad y comodidad al hogar.', 'Sofá Belgrado - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('27', 'Sofá Badajoz', 'sofa-badajoz', 3500000, NULL, NULL, 5, 'sala', 'Sofá Badajoz diseñado para aportar personalidad y comodidad al hogar.', 'Sofá Badajoz - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('28', 'Confort L', 'confort-l', 3500000, NULL, NULL, 5, 'sala', 'Confort L diseñado para aportar personalidad y comodidad al hogar.', 'Confort L - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('29', 'Comedor Oxford Grey', 'comedor-oxford-grey', 4500000, NULL, NULL, 5, 'comedor', 'Comedor Oxford Grey elegante y resistente creado para el encuentro familiar.', 'Comedor Oxford Grey - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('30', 'Set Marble Luxury', 'set-marble-luxury', 4500000, NULL, NULL, 5, 'comedor', 'Set Marble Luxury elegante y resistente creado para el encuentro familiar.', 'Set Marble Luxury - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('31', 'Comedor Aqua Velvet', 'comedor-aqua-velvet', 4500000, NULL, NULL, 5, 'comedor', 'Comedor Aqua Velvet elegante y resistente creado para el encuentro familiar.', 'Comedor Aqua Velvet - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('32', 'Modelo Estocolmo', 'modelo-estocolmo', 4500000, NULL, NULL, 5, 'comedor', 'Modelo Estocolmo elegante y resistente creado para el encuentro familiar.', 'Modelo Estocolmo - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('33', 'Comedor Natura Square', 'comedor-natura-square', 4500000, NULL, NULL, 5, 'comedor', 'Comedor Natura Square elegante y resistente creado para el encuentro familiar.', 'Comedor Natura Square - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('34', 'Set Urban Loft', 'set-urban-loft', 4500000, NULL, NULL, 5, 'comedor', 'Set Urban Loft elegante y resistente creado para el encuentro familiar.', 'Set Urban Loft - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('35', 'Comedor Pure White', 'comedor-pure-white', 4500000, NULL, NULL, 5, 'comedor', 'Comedor Pure White elegante y resistente creado para el encuentro familiar.', 'Comedor Pure White - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('36', 'Colección Versalles', 'coleccion-versalles', 4500000, NULL, NULL, 5, 'comedor', 'Colección Versalles elegante y resistente creado para el encuentro familiar.', 'Colección Versalles - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('37', 'Modelo Prisma Noir', 'modelo-prisma-noir', 2500000, NULL, NULL, 5, 'alcobas', 'Modelo Prisma Noir, diseño que combina confort, funcionalidad y estilo para el descanso.', 'Modelo Prisma Noir - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('38', 'Modelo Majestic Gold', 'modelo-majestic-gold', 2500000, NULL, NULL, 5, 'alcobas', 'Modelo Majestic Gold, diseño que combina confort, funcionalidad y estilo para el descanso.', 'Modelo Majestic Gold - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('39', 'Modelo Heritage', 'modelo-heritage', 2500000, NULL, NULL, 5, 'alcobas', 'Modelo Heritage, diseño que combina confort, funcionalidad y estilo para el descanso.', 'Modelo Heritage - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('40', 'Modelo Royal Nursery', 'modelo-royal-nursery', 2500000, NULL, NULL, 5, 'alcobas', 'Modelo Royal Nursery, diseño que combina confort, funcionalidad y estilo para el descanso.', 'Modelo Royal Nursery - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('41', 'Classic', 'classic', 2500000, NULL, NULL, 5, 'alcobas', 'Classic, diseño que combina confort, funcionalidad y estilo para el descanso.', 'Classic - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('42', 'Modelo Petit Baron', 'modelo-petit-baron', 2500000, NULL, NULL, 5, 'alcobas', 'Modelo Petit Baron, diseño que combina confort, funcionalidad y estilo para el descanso.', 'Modelo Petit Baron - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01'),

('43', 'Modelo Crystal Line', 'modelo-crystal-line', 2500000, NULL, NULL, 5, 'alcobas', 'Modelo Crystal Line, diseño que combina confort, funcionalidad y estilo para el descanso.', 'Modelo Crystal Line - Catálogo 2026', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], '{"width":200,"height":100,"depth":100}', ARRAY['Madera', 'Tela'], NULL, FALSE, FALSE, TRUE, 5.0, 0, '2026-03-01');


-- ─── BLOG POSTS (4) ─────────────────────────────────

INSERT INTO blog_posts (id, title, slug, excerpt, content, image, author, author_avatar, category, tags, read_time, created_at) VALUES

('1', 'Cómo elegir el sofá perfecto para tu sala', 'como-elegir-sofa-perfecto',
 'Guía completa para seleccionar el sofá ideal considerando espacio, estilo y presupuesto.',
 '<p>Elegir el sofá perfecto puede ser una tarea abrumadora, pero con la guía correcta, puedes encontrar la pieza ideal para tu hogar.</p><h2>1. Mide tu espacio</h2><p>Antes de enamorarte de un sofá, asegúrate de medir el espacio disponible. Deja al menos 45cm de espacio para circulación alrededor del mueble.</p><h2>2. Define tu estilo</h2><p>¿Prefieres un look moderno o clásico? Los sofás modulares son perfectos para espacios contemporáneos, mientras que los Chesterfield aportan elegancia tradicional.</p><h2>3. Considera el uso</h2><p>Si tienes niños o mascotas, opta por telas antimanchas. Para espacios de entretenimiento, busca modelos con asientos profundos.</p>',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
 'María Daniela',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
 'Guías', ARRAY['Sofás','Decoración','Consejos'], 5, '2024-03-01'),

('2', 'Tendencias en muebles de madera 2024', 'tendencias-muebles-madera-2024',
 'Descubre las últimas tendencias en mobiliario de madera que dominarán este año.',
 '<p>El 2024 trae consigo un renovado interés por los muebles de madera natural y sostenibles.</p><h2>Madera recuperada</h2><p>Los muebles elaborados con madera recuperada no solo son ecológicos, sino que aportan historia y carácter único a los espacios.</p><h2>Acabados naturales</h2><p>Los acabados que resaltan las vetas naturales de la madera están en auge, dejando atrás las lacas brillantes.</p>',
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
 'Carlos Artesano',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
 'Tendencias', ARRAY['Madera','Sostenibilidad','2024'], 4, '2024-02-15'),

('3', 'El arte del mueble artesanal colombiano', 'arte-mueble-artesanal-colombiano',
 'Conoce la rica tradición de la ebanistería colombiana y cómo la preservamos.',
 '<p>Colombia tiene una tradición centenaria en la elaboración de muebles de madera que combina técnicas ancestrales con diseño contemporáneo.</p><h2>Nuestra herencia</h2><p>Los maestros ebanistas colombianos han transmitido sus conocimientos de generación en generación, creando piezas únicas que cuentan historias.</p>',
 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
 'María Daniela',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
 'Historia', ARRAY['Artesanía','Colombia','Tradición'], 6, '2024-01-20'),

('4', 'Guía de cuidado para muebles de madera', 'guia-cuidado-muebles-madera',
 'Aprende a mantener tus muebles de madera en perfecto estado por décadas.',
 '<p>Con el cuidado adecuado, los muebles de madera pueden durar generaciones manteniendo su belleza original.</p><h2>Limpieza regular</h2><p>Usa un paño suave ligeramente húmedo para quitar el polvo. Evita productos con silicona o amoníaco.</p><h2>Protección solar</h2><p>La exposición directa al sol puede decolorar la madera. Usa cortinas o ubica los muebles lejos de ventanas.</p>',
 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
 'Pedro Maestro',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
 'Cuidados', ARRAY['Mantenimiento','Madera','Consejos'], 3, '2024-02-28');


-- =====================================================
-- ✅ VERIFICACIÓN
-- Ejecuta estas consultas para confirmar que todo se insertó:
-- =====================================================
-- SELECT COUNT(*) AS total_products FROM products;  -- Debería dar 20
-- SELECT COUNT(*) AS total_blog_posts FROM blog_posts;  -- Debería dar 4
-- =====================================================
