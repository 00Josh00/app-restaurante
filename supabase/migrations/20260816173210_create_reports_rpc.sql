-- ============================================================
-- RPC get_reports: agregados de ventas para el dashboard admin
-- ============================================================

create or replace function public.get_reports()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver reportes';
  end if;

  select jsonb_build_object(
    'today', jsonb_build_object(
      'revenue', coalesce((select sum(o.total) from public.orders o where o.status = 'cobrado' and o.created_at::date = current_date), 0),
      'count', (select count(*) from public.orders o where o.status = 'cobrado' and o.created_at::date = current_date)
    ),
    'by_type', (
      select coalesce(
        jsonb_object_agg(
          t.type,
          jsonb_build_object('count', t.cnt, 'revenue', t.rev)
        ),
        '{}'::jsonb
      )
      from (
        select o.type, count(*) as cnt, coalesce(sum(o.total), 0) as rev
        from public.orders o
        where o.status = 'cobrado' and o.created_at::date = current_date
        group by o.type
      ) t
    ),
    'top_items', (
      select coalesce(
        jsonb_agg(row_to_json(sub) order by sub.revenue desc),
        '[]'::jsonb
      )
      from (
        select oi.name, sum(oi.quantity)::int as quantity, sum(oi.subtotal) as revenue
        from public.order_items oi
        join public.orders o on o.id = oi.order_id
        where o.status = 'cobrado' and o.created_at::date = current_date
        group by oi.name
        order by sub.revenue desc
        limit 5
      ) sub
    ),
    'last_7_days', (
      select coalesce(
        jsonb_agg(row_to_json(sub) order by sub.day),
        '[]'::jsonb
      )
      from (
        select d.day, coalesce(sum(o.total), 0) as revenue
        from generate_series(current_date - interval '6 days', current_date, interval '1 day') as d(day)
        left join public.orders o on o.created_at::date = d.day and o.status = 'cobrado'
        group by d.day
      ) sub
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_reports() from anon, public;
grant execute on function public.get_reports() to authenticated;