-- ============================================================
-- Delivery: recargo de S/5.00 sobre el total cuando p_type = 'delivery'
-- ============================================================

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
  v_delivery_fee constant numeric(10, 2) := 5.00;
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

  -- Recargo de delivery
  if p_type = 'delivery' then
    v_total := v_total + v_delivery_fee;
  end if;

  update public.orders set total = v_total where id = v_order.id;

  -- Recargar el registro actualizado antes de devolverlo
  select * into v_order from public.orders where id = v_order.id;

  return v_order;
end;
$$;

revoke all on function public.create_order(public.order_type, uuid, text, text, jsonb) from anon, public;
grant execute on function public.create_order(public.order_type, uuid, text, text, jsonb) to authenticated;