-- ============================================================
-- Seguridad de órdenes: restringir updates por rol y columna
-- - La política de update solo permite al staff.
-- - Un trigger impide modificar columnas que no sean 'status'
--   y valida transiciones de estado según el rol:
--     cook   : pendiente → en_cocina → listo → entregado
--     waiter : listo → entregado, entregado → cobrado
--     admin  : cualquier transición
-- ============================================================

-- 1. Política RLS más estricta
drop policy if exists "orders_update_staff" on public.orders;
create policy "orders_update_staff" on public.orders
  for update to authenticated
  using (true)
  with check (public.get_my_role() in ('waiter', 'admin', 'cook'));

-- 2. Trigger que valida columnas y transiciones
create or replace function public.orders_check_update()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_role public.app_role;
begin
  -- Updates internos de create_order (fijar el total calculado).
  -- create_order enciende y apaga este flag alrededor del update.
  if coalesce(current_setting('app.orders_internal_update', true), '') = 'on' then
    return new;
  end if;

  -- Solo se permite cambiar el estado; el resto de campos queda intacto
  if new.total is distinct from old.total
     or new.type is distinct from old.type
     or new.table_id is distinct from old.table_id
     or new.customer_name is distinct from old.customer_name
     or new.note is distinct from old.note
     or new.created_by is distinct from old.created_by then
    raise exception 'Solo se puede actualizar el estado de la orden';
  end if;

  if new.status = old.status then
    return new;
  end if;

  v_role := public.get_my_role();

  if v_role = 'admin' then
    return new;
  end if;

  if v_role = 'cook' then
    if (old.status = 'pendiente' and new.status = 'en_cocina')
       or (old.status = 'en_cocina' and new.status = 'listo')
       or (old.status = 'listo' and new.status = 'entregado') then
      return new;
    end if;
  end if;

  if v_role = 'waiter' then
    if (old.status = 'listo' and new.status = 'entregado')
       or (old.status = 'entregado' and new.status = 'cobrado') then
      return new;
    end if;
  end if;

  raise exception 'Transición de estado no permitida para tu rol';
end;
$$;

drop trigger if exists orders_check_update on public.orders;
create trigger orders_check_update
  before update on public.orders
  for each row execute function public.orders_check_update();

revoke all on function public.orders_check_update() from anon, public, authenticated;