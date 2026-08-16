-- ============================================================
-- Fase 2: Autenticación y roles (admin / waiter / cook)
-- ============================================================

-- 1. Enum de roles
do $$ begin
  create type public.app_role as enum ('admin', 'waiter', 'cook');
exception when duplicate_object then null;
end $$;

-- 2. Tabla de perfiles (1:1 con auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'waiter',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 3. Helpers de autorización
-- Nota: funciones security definer restringidas solo a rol 'authenticated'.
create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

revoke all on function public.get_my_role() from anon, public;
revoke all on function public.is_admin() from anon, public;
grant execute on function public.get_my_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- 4. Trigger: crear perfil al registrar un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

revoke all on function public.handle_new_user() from anon, public, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Políticas RLS
-- Leer: cada usuario su propio perfil + admins pueden ver todos
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_admin());

-- Actualizar: usuario edita su propio perfil (sin cambiar rol)
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Actualizar: admin gestiona cualquier perfil (incluye cambiar rol)
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (true);
