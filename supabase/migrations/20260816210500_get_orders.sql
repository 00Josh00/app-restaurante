-- ============================================================
-- Regla de negocio: historial de órdenes centralizado.
-- get_orders() centraliza el límite por página, la paginación
-- y los conteos por estado (que antes se calculaban en cliente).
-- Devuelve { orders[], counts{}, total } en un solo viaje.
-- ============================================================

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
    limit greatest(1, coalesce(p_limit, 50))
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
