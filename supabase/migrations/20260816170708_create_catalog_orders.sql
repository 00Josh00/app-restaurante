-- ============================================================
-- Fase 3: Catálogo (categorías y platillos), mesas y órdenes
-- ============================================================

-- 1. Enums
do $$ begin
  create type public.order_type as enum ('mesa', 'delivery');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum ('pendiente', 'en_cocina', 'listo', 'entregado', 'cobrado');
exception when duplicate_object then null;
end $$;

-- 2. Categorías del menú
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Platillos
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Mesas
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  created_at timestamptz not null default now()
);

-- 5. Órdenes (comandas)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  type public.order_type not null,
  table_id uuid references public.tables (id) on delete set null,
  customer_name text,
  note text,
  status public.order_status not null default 'pendiente',
  total numeric(10, 2) not null default 0 check (total >= 0),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_table_check check (type = 'delivery' or table_id is not null)
);

-- 6. Items de cada orden
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0)
);

-- 7. Índices
create index if not exists menu_items_category_idx on public.menu_items (category_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- 8. Trigger updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- 9. Realtime para notificaciones de cocina
alter publication supabase_realtime add table public.orders;

-- 10. RLS
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Catálogo y mesas: lectura para todo el staff, escritura solo admin
create policy "categories_select_staff" on public.categories
  for select to authenticated using (true);

create policy "categories_write_admin" on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "menu_items_select_staff" on public.menu_items
  for select to authenticated using (true);

create policy "menu_items_write_admin" on public.menu_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tables_select_staff" on public.tables
  for select to authenticated using (true);

create policy "tables_write_admin" on public.tables
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Órdenes: el staff ve todas, mesero/admin crean, el staff actualiza estados
create policy "orders_select_staff" on public.orders
  for select to authenticated using (true);

create policy "orders_insert_staff" on public.orders
  for insert to authenticated
  with check (public.get_my_role() in ('waiter', 'admin'));

create policy "orders_update_staff" on public.orders
  for update to authenticated
  using (true)
  with check (true);

create policy "order_items_select_staff" on public.order_items
  for select to authenticated using (true);

create policy "order_items_insert_staff" on public.order_items
  for insert to authenticated
  with check (exists (
    select 1 from public.orders
    where orders.id = order_id
  ));

-- 11. Seed: un par de mesas
insert into public.tables (label)
values ('Mesa 1'), ('Mesa 2')
on conflict (label) do nothing;
