-- ============================================================
-- Settings: fee de delivery como única fuente de verdad
-- La tabla `settings` define el recargo; el RPC create_order lo
-- lee y el front lo consulta (en vez de hardcodearlo en 2 lados).
-- ============================================================

-- 1. Tabla de configuración
create table if not exists public.settings (
  key text primary key,
  value numeric(10, 2),
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

-- Lectura para todo el staff, escritura solo admin
create policy "settings_select_staff" on public.settings
  for select to authenticated using (true);

create policy "settings_write_admin" on public.settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.settings (key, value) values ('delivery_fee', 5.00)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- 2. create_order lee el fee desde settings
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
  v_total numeric(10, 2) := 0;
  v_delivery_fee numeric(10, 2);
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
    select * into v_menu
    from public.menu_items
    where id = (v_item ->> 'menu_item_id')::uuid;

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
      (v_item ->> 'quantity')::int,
      v_menu.price * (v_item ->> 'quantity')::int
    );

    v_total := v_total + v_menu.price * (v_item ->> 'quantity')::int;
  end loop;

  -- Recargo de delivery desde settings (fallback 5.00)
  if p_type = 'delivery' then
    select value into v_delivery_fee from public.settings where key = 'delivery_fee';
    if v_delivery_fee is null then
      v_delivery_fee := 5.00;
    end if;
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