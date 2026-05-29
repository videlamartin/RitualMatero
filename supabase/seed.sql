-- ============================================
-- RITUAL MATERO — DATOS DEMO (NUEVO)
-- ============================================

-- Limpiar tablas
delete from order_items;
delete from orders;
delete from product_sizes;
delete from products;

-- ============================================
-- 1. INSERTAR PRODUCTOS
-- ============================================

insert into products (id, name, description, price, category, featured, images) values
-- MATES
('11111111-0001-0001-0001-000000000001', 'Mate 100% personalizado', 'Personalizado a tu gusto', 15000, 'mates', true, array['https://picsum.photos/seed/rm-mate-1/800/800']),
('11111111-0001-0001-0001-000000000002', 'Matera ovalada', 'Cuerina reforzada', 20000, 'mates', true, array['https://picsum.photos/seed/rm-matera-1/800/800']),
('11111111-0001-0001-0001-000000000003', 'Imperial liso', 'Calabaza con virola de alpaca', 40000, 'mates', true, array['https://picsum.photos/seed/rm-mate-imp-1/800/800']),
('11111111-0001-0001-0001-000000000004', 'Camionero de algarrobo', 'Virola de acero inoxidable', 28000, 'mates', true, array['https://picsum.photos/seed/rm-mate-cam-1/800/800']),
('11111111-0001-0001-0001-000000000005', 'Torpedo liso', 'Calabaza con virola de acero inoxidable', 38000, 'mates', false, array['https://picsum.photos/seed/rm-mate-tor-1/800/800']),
('11111111-0001-0001-0001-000000000006', 'Camionero criollo', 'Mate de calabaza con base de cuero', 30000, 'mates', false, array['https://picsum.photos/seed/rm-mate-cri-1/800/800']),
('11111111-0001-0001-0001-000000000007', 'Imperial de algarrobo con base', 'Virola de acero inoxidable, fleje y base de alpaca', 50000, 'mates', true, array['https://picsum.photos/seed/rm-mate-impalg-1/800/800']),
('11111111-0001-0001-0001-000000000008', 'Imperial de algarrobo', 'Virola de acero inoxidable y madera laqueada', 35000, 'mates', false, array['https://picsum.photos/seed/rm-mate-impalg-2/800/800']),

-- BOMBILLAS
('22222222-0002-0002-0002-000000000001', 'Bombilla alpaca pico de loro', 'Acabado artesanal en alpaca', 7999, 'bombillas', true, array['https://picsum.photos/seed/rm-bombilla-1/800/800']),
('22222222-0002-0002-0002-000000000002', 'Bombilla acero filtro espiral', 'Acero inoxidable 316L', 6499, 'bombillas', true, array['https://picsum.photos/seed/rm-bombilla-2/800/800']),
('22222222-0002-0002-0002-000000000003', 'Bombilla de bambú natural', 'Ecológica y natural', 5999, 'bombillas', false, array['https://picsum.photos/seed/rm-bombilla-3/800/800']),

-- TERMOS
('33333333-0003-0003-0003-000000000001', 'Termo Stanley Classic 1L', 'Acero inoxidable, mantiene temperatura 24hs', 45000, 'termos', true, array['https://picsum.photos/seed/rm-termo-1/800/800']),
('33333333-0003-0003-0003-000000000002', 'Termo Cebador 500ml', 'Compacto para llevar a todos lados', 28000, 'termos', true, array['https://picsum.photos/seed/rm-termo-2/800/800']),
('33333333-0003-0003-0003-000000000003', 'Termo Lumilagro 1.5L', 'Clásico argentino', 22000, 'termos', false, array['https://picsum.photos/seed/rm-termo-3/800/800']),

-- YERBAS
('44444444-0004-0004-0004-000000000001', 'Yerba Rosamonte Especial', 'Con palo, corte tradicional', 8999, 'yerbas', true, array['https://picsum.photos/seed/rm-yerba-1/800/800']),
('44444444-0004-0004-0004-000000000002', 'Yerba Taragüi Sin Palo', 'Suave y pareja', 6499, 'yerbas', false, array['https://picsum.photos/seed/rm-yerba-2/800/800']),
('44444444-0004-0004-0004-000000000003', 'Yerba Playadito 1kg', 'Con palo, rendidora', 7999, 'yerbas', false, array['https://picsum.photos/seed/rm-yerba-3/800/800']),

-- ACCESORIOS
('55555555-0005-0005-0005-000000000001', 'Yerbera cerámica artesanal', 'Hecha a mano', 12999, 'accesorios', false, array['https://picsum.photos/seed/rm-acc-1/800/800']),
('55555555-0005-0005-0005-000000000002', 'Posamate cuero genuino', 'Protege tu mesa', 4999, 'accesorios', false, array['https://picsum.photos/seed/rm-acc-2/800/800']),

-- COMBOS
('66666666-0006-0006-0006-000000000001', 'Combo Iniciación Matero', 'Mate + bombilla + yerba 500g', 39999, 'combos', true, array['https://picsum.photos/seed/rm-combo-1/800/800']),
('66666666-0006-0006-0006-000000000002', 'Combo Regalo Premium', 'Mate artesanal + termo + yerba + caja', 89999, 'combos', true, array['https://picsum.photos/seed/rm-combo-2/800/800']);

-- ============================================
-- 2. INSERTAR STOCK POR VARIANTE
-- ============================================

-- MATES
-- Mate 100% personalizado (calabaza) -> natural, curado
insert into product_sizes (product_id, size, stock) values
('11111111-0001-0001-0001-000000000001', 'natural', 15),
('11111111-0001-0001-0001-000000000001', 'curado', 5);

-- Matera ovalada (accesorio camuflado) -> unico
insert into product_sizes (product_id, size, stock) values
('11111111-0001-0001-0001-000000000002', 'unico', 8);

-- Imperial liso (calabaza) -> natural, curado
insert into product_sizes (product_id, size, stock) values
('11111111-0001-0001-0001-000000000003', 'natural', 10),
('11111111-0001-0001-0001-000000000003', 'curado', 2);

-- Camionero de algarrobo (madera) -> unico
insert into product_sizes (product_id, size, stock) values
('11111111-0001-0001-0001-000000000004', 'unico', 12);

-- Torpedo liso (calabaza) -> natural, curado
insert into product_sizes (product_id, size, stock) values
('11111111-0001-0001-0001-000000000005', 'natural', 20),
('11111111-0001-0001-0001-000000000005', 'curado', 6);

-- Camionero criollo (calabaza) -> natural, curado
insert into product_sizes (product_id, size, stock) values
('11111111-0001-0001-0001-000000000006', 'natural', 14),
('11111111-0001-0001-0001-000000000006', 'curado', 4);

-- Imperial de algarrobo con base (madera) -> unico
insert into product_sizes (product_id, size, stock) values
('11111111-0001-0001-0001-000000000007', 'unico', 5);

-- Imperial de algarrobo (madera) -> unico
insert into product_sizes (product_id, size, stock) values
('11111111-0001-0001-0001-000000000008', 'unico', 9);

-- BOMBILLAS (unico)
insert into product_sizes (product_id, size, stock) values
('22222222-0002-0002-0002-000000000001', 'unico', 45),
('22222222-0002-0002-0002-000000000002', 'unico', 60),
('22222222-0002-0002-0002-000000000003', 'unico', 15);

-- TERMOS
-- Stanley 1L
insert into product_sizes (product_id, size, stock) values
('33333333-0003-0003-0003-000000000001', '1l', 10);
-- Cebador 500ml
insert into product_sizes (product_id, size, stock) values
('33333333-0003-0003-0003-000000000002', '500ml', 25);
-- Lumilagro 1.5L
insert into product_sizes (product_id, size, stock) values
('33333333-0003-0003-0003-000000000003', '1.5l', 30);

-- YERBAS
-- Rosamonte (500g, 1kg)
insert into product_sizes (product_id, size, stock) values
('44444444-0004-0004-0004-000000000001', '500g', 50),
('44444444-0004-0004-0004-000000000001', '1kg', 40);
-- Taragui (500g, 1kg)
insert into product_sizes (product_id, size, stock) values
('44444444-0004-0004-0004-000000000002', '500g', 60),
('44444444-0004-0004-0004-000000000002', '1kg', 35);
-- Playadito (1kg)
insert into product_sizes (product_id, size, stock) values
('44444444-0004-0004-0004-000000000003', '1kg', 80);

-- ACCESORIOS (unico)
insert into product_sizes (product_id, size, stock) values
('55555555-0005-0005-0005-000000000001', 'unico', 18),
('55555555-0005-0005-0005-000000000002', 'unico', 35);

-- COMBOS (unico)
insert into product_sizes (product_id, size, stock) values
('66666666-0006-0006-0006-000000000001', 'unico', 10),
('66666666-0006-0006-0006-000000000002', 'unico', 4);
