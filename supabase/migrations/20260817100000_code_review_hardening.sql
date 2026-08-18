-- ============================================================
-- Endurecimiento tras revisión de código (2026-08-17)
-- 1. Las órdenes solo se crean vía RPC create_order: se revocan
--    las políticas de INSERT sobre orders/order_items para que
--    nadie fije total/status/precios arbitrarios (RLS). create_order
--    es security definer y no se ve afectado.
-- 2. orders_check_update también protege id y created_at.
-- 3. create_order valida uuid y cantidad (> 0, tope 999).
-- 4. get_orders topea p_limit (máx. 200 por página).
-- 5. Se elimina get_reports (sin uso en el front y con TZ
--    inconsistente vs get_reports_month).
-- ============================================================

-- 1. Solo el RPC crea órdenes
drop policy if exists "orders_insert_staff" on public.orders;
drop policy if exists "order_items_insert_staff" on public.order_items;

-- 2. Trigger de updates: proteger id y created_at
create or replace function public.orders_check_update()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_role public.app_role;
begin
  -- Updates internos de create_order (fijar el total calculado).
  if coalesce(current_setting('app.orders_internal_update', true), '') = 'on' then
    return new;
  end if;

  -- Solo se permite cambiar el estado; el resto de campos queda intacto
  if new.id is distinct from old.id
     or new.total is distinct from old.total
     or new.type is distinct from old.type
     or new.table_id is distinct from old.table_id
     or new.customer_name is distinct from old.customer_name
     or new.note is distinct from old.note
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
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

-- 3. create_order con validaciones de items
create or replace function public.create_order(
  p_type public.order_type,
  p_table_id uuid,
  p_customer_name text,
  p_note text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_menu public.menu_items%rowtype;
  v_qty int;
  v_total numeric(10, 2) := 0;
  v_delivery_fee numeric(10, 2);
  v_item_id text;
begin
  -- Solo mesero o admin puede crear órdenes
  if public.get_my_role() not in ('waiter', 'admin') then
    raise exception 'Sin permiso para crear órdenes';
  end if;

  -- Validaciones básicas
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'La orden no tiene items';
  end if;

  if p_type = 'mesa' and p_table_id is null then
    raise exception 'Debe indicar la mesa';
  end if;

  insert into public.orders (type, table_id, customer_name, note, created_by, total)
  values (p_type, p_table_id, p_customer_name, p_note, auth.uid(), 0)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_item_id := v_item ->> 'menu_item_id';
    if v_item_id is null or v_item_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Platillo inexistente';
    end if;

    if (v_item ->> 'quantity') is null or (v_item ->> 'quantity') !~ '^[0-9]+$' then
      raise exception 'Cantidad inválida';
    end if;
    v_qty := (v_item ->> 'quantity')::int;

    if v_qty <= 0 then
      raise exception 'Cantidad inválida';
    end if;
    if v_qty > 999 then
      raise exception 'Cantidad demasiado grande';
    end if;

    select * into v_menu
    from public.menu_items
    where id = v_item_id::uuid;

    if not found then
      raise exception 'Platillo inexistente';
    end if;

    if not v_menu.available then
      raise exception 'Platillo no disponible: %', v_menu.name;
    end if;

    insert into public.order_items (order_id, menu_item_id, name, unit_price, quantity, subtotal)
    values (
      v_order.id,
      v_menu.id,
      v_menu.name,
      v_menu.price,
      v_qty,
      v_menu.price * v_qty
    );

    v_total := v_total + v_menu.price * v_qty;
  end loop;

  -- Recargo de delivery: única fuente en BD
  if p_type = 'delivery' then
    v_delivery_fee := public.get_delivery_fee();
    v_total := v_total + v_delivery_fee;
  end if;

  -- Flag para que orders_check_update permita fijar el total calculado
  perform set_config('app.orders_internal_update', 'on', true);
  update public.orders set total = v_total where id = v_order.id;
  perform set_config('app.orders_internal_update', 'off', true);

  -- Recargar el registro actualizado antes de devolverlo
  select * into v_order from public.orders where id = v_order.id;

  return v_order;
end;
$$;

revoke all on function public.create_order(public.order_type, uuid, text, text, jsonb) from anon, public;
grant execute on function public.create_order(public.order_type, uuid, text, text, jsonb) to authenticated;

-- 4. get_orders con tope de página
create or replace function public.get_orders(
  p_status public.order_status default null,
  p_limit int default 50,
  p_offset int default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_counts jsonb;
  v_orders jsonb;
  v_total int;
  v_limit int := least(200, greatest(1, coalesce(p_limit, 50)));
begin
  if public.get_my_role() not in ('waiter', 'admin', 'cook') then
    raise exception 'Sin permisos';
  end if;

  -- Conteos globales por estado (independientes del filtro actual)
  select coalesce(jsonb_object_agg(o.status::text, o.cnt), '{}'::jsonb) into v_counts
  from (
    select o.status, count(*) as cnt
    from public.orders o
    group by o.status
  ) o;

  -- Total que coincide con el filtro (para paginación)
  select count(*) into v_total
  from public.orders o
  where p_status is null or o.status = p_status;

  -- Página de órdenes con etiqueta de mesa e items
  select coalesce(jsonb_agg(to_jsonb(sub)), '[]'::jsonb) into v_orders
  from (
    select
      o.id,
      o.type,
      o.table_id,
      t.label as table_label,
      o.customer_name,
      o.note,
      o.status,
      o.total,
      o.created_by,
      o.created_at,
      coalesce((
        select jsonb_agg(jsonb_build_object('id', oi.id, 'name', oi.name, 'quantity', oi.quantity))
        from public.order_items oi
        where oi.order_id = o.id
      ), '[]'::jsonb) as order_items
    from public.orders o
    left join public.tables t on t.id = o.table_id
    where p_status is null or o.status = p_status
    order by o.created_at desc
    limit v_limit
    offset greatest(0, coalesce(p_offset, 0))
  ) sub;

  return jsonb_build_object(
    'orders', v_orders,
    'counts', v_counts || jsonb_build_object('todos', (select count(*) from public.orders)),
    'total', v_total
  );
end;
$$;

revoke all on function public.get_orders(public.order_status, int, int) from anon, public;
grant execute on function public.get_orders(public.order_status, int, int) to authenticated;

-- 5. get_reports quedó sin uso (la página usa get_reports_month) y con
--    zona horaria del servidor; se elimina para evitar confusión.
drop function if exists public.get_reports();
