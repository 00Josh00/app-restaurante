# Plan: App de Restaurante (Vercel + Supabase)

## Arquitectura

- **Frontend:** Next.js + TypeScript + Tailwind (ideal para Vercel, API routes, middleware de auth y PWA).
- **Backend/Datos:** Supabase (Postgres + Auth + Realtime + Storage).
- **PWA:** instalable en el celular, con notificaciones.

## Roles

- **Admin:** gestiona el menú y ve los reportes.
- **Mesero/recepcionista:** toma pedidos (mesa o delivery).
- **Cocinero:** recibe pedidos en tiempo real y cambia sus estados.

## Modelo de datos (Postgres)

- `tables` — mesas (id, nombre/número)
- `categories` — categorías del menú
- `menu_items` — platillos (nombre, precio, descripción, foto)
- `orders` — comandas (tipo: mesa/delivery, table_id, cliente, estado, total, creado_por)
- `order_items` — items de cada comanda (producto, cantidad, precio)

Flujo de estados de una orden: `pendiente → en_cocina → listo → entregado → cobrado`

## Fases de implementación

1. **Setup:** init Next.js + Supabase CLI (migraciones en repo) + conexión Vercel.
2. **Auth y roles:** Supabase Auth (email/password), tabla `profiles` con rol, login y protección de rutas (mesero vs cocinero).
3. **Migración de datos:** SQL de tablas + RLS (solo staff autenticado accede a órdenes).
4. **Menú y toma de pedidos:** CRUD de menú (admin), pantalla de pedido (elegir mesa/delivery, agregar items, total).
5. **Cocina en tiempo real:** suscripción a **Supabase Realtime** en `orders` → el cocinero recibe el pedido al instante + alerta sonora/visual. Estados `en_cocina → listo`.
6. **PWA:** manifest + service worker → "Agregar a pantalla de inicio" en el celular.
7. **Reportes:** dashboard (ventas del día, por mesa/delivery, platillos más vendidos).
8. **Despliegue:** aplicar migraciones, RLS, env vars, deploy a Vercel.

## Decisiones técnicas clave

- **Notificación al cocinero:** Realtime es suficiente (la app está abierta). Notificación push en segundo plano se añade después con Edge Functions (web push).
- **Seguridad:** RLS activo en todas las tablas; roles en `app_metadata`, nunca en datos editables por el usuario.
- **Inventario:** fuera de alcance por ahora; el schema queda preparado para añadirlo después.