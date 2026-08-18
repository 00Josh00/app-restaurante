# Kleta · Restaurante

App de gestión de pedidos para restaurante (PWA, mobile-first): toma de pedidos
en mesa y delivery, cocina en tiempo real, historial de órdenes, reportes por
mes y gestión de usuarios y menú.

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Serwist (PWA)
- **Backend/Datos:** Supabase (Auth + Postgres + RLS + Realtime)
- **Roles:** `admin` (menú, reportes, usuarios), `waiter` (toma pedidos, cobra), `cook` (cocina)

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Crear `.env` a partir de `.env.example` con las credenciales de Supabase:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # solo se usa en el server (API de admin)
   ```

3. Aplicar migraciones a la base (remota o local con `supabase start`):

   ```bash
   supabase db push
   ```

   > El menú de ejemplo se carga con `supabase db reset` (seed local); **no** se
   > aplica como migración para no borrar datos de producción.

4. Levantar el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

## Scripts

| Comando        | Acción                          |
| -------------- | ------------------------------- |
| `pnpm dev`     | Servidor de desarrollo          |
| `pnpm build`   | Build de producción             |
| `pnpm start`   | Servidor de producción          |
| `pnpm lint`    | ESLint                          |
| `tsc --noEmit` | Chequeo de tipos (via pnpm exec)|

## Arquitectura

- **Reglas de negocio en la BD:** los totales se calculan en el RPC
  `create_order` (el cliente nunca define precios), el fee de delivery vive en
  `settings`/`get_delivery_fee()`, y las transiciones de estado
  (`pendiente → en_cocina → listo → entregado → cobrado`) se validan por rol en
  el trigger `orders_check_update`. La creación de órdenes solo ocurre vía RPC:
  las políticas RLS de `orders`/`order_items` no permiten INSERT directo.
- **Seguridad:** RLS activo en todas las tablas; roles en `profiles` (nunca en
  datos editables por el usuario); signup público desactivado (solo el admin
  crea usuarios vía `/api/admin/users` con service role); funciones
  `security definer` con `search_path` fijo y grants mínimos.
- **Tiempo real:** la cocina se suscribe a cambios en `orders` vía Supabase
  Realtime (alerta sonora y visual al recibir un pedido).
- **PWA:** instalable con Serwist; `src/proxy.ts` (ex-`middleware`) refresca la
  sesión de Supabase.

## Base de datos

Las migraciones viven en `supabase/migrations/` y el seed local en
`supabase/seed.sql`. Para regenerar los tipos de TypeScript:

```bash
supabase gen types typescript --linked > src/lib/database.types.ts
```
