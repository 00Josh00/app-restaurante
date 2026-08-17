-- Limpieza de datos de prueba
delete from public.order_items;
delete from public.orders;
delete from public.menu_items;
delete from public.categories;

-- Categorías de la cevichería
insert into public.categories (name, sort_order) values
  ('Ceviches', 1),
  ('Chicharrones', 2),
  ('Arroces y chaufas', 3),
  ('Fondos y sopas', 4),
  ('Para compartir', 5),
  ('Bebidas y tigres', 6);

-- Platillos de la cevichería con precios de referencia (S/)
insert into public.menu_items (category_id, name, price, available) values
  ((select id from public.categories where name = 'Ceviches'), 'Ceviche de pescado', 32.00, true),
  ((select id from public.categories where name = 'Ceviches'), 'Ceviche mixto', 38.00, true),
  ((select id from public.categories where name = 'Chicharrones'), 'Chicharrón de pota', 26.00, true),
  ((select id from public.categories where name = 'Chicharrones'), 'Chicharrón de pescado', 28.00, true),
  ((select id from public.categories where name = 'Arroces y chaufas'), 'Arroz con mariscos', 34.00, true),
  ((select id from public.categories where name = 'Arroces y chaufas'), 'Chaufa de pescado', 30.00, true),
  ((select id from public.categories where name = 'Arroces y chaufas'), 'Chaufa de mariscos', 35.00, true),
  ((select id from public.categories where name = 'Fondos y sopas'), 'Sudado', 30.00, true),
  ((select id from public.categories where name = 'Fondos y sopas'), 'Parihuela', 38.00, true),
  ((select id from public.categories where name = 'Para compartir'), 'Jalea mixta', 45.00, true),
  ((select id from public.categories where name = 'Para compartir'), 'Duos', 25.00, true),
  ((select id from public.categories where name = 'Para compartir'), 'Trios', 30.00, true),
  ((select id from public.categories where name = 'Bebidas y tigres'), 'Chilcano acevichado', 18.00, true),
  ((select id from public.categories where name = 'Bebidas y tigres'), 'Leche de tigre', 20.00, true);