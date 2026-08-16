-- ============================================================
-- get_reports_month: ventas de un mes agrupadas por semana
-- (fines de semana): Semana 1 = días 1-7, Semana 2 = 8-14, etc.
-- Todo en horario de Lima (America/Lima)
-- ============================================================

create or replace function public.get_reports_month(p_month date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz := (p_month at time zone 'America/Lima');
  v_end timestamptz := ((p_month + interval '1 month') at time zone 'America/Lima');
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver reportes';
  end if;

  select jsonb_build_object(
    'month', to_char(p_month, 'YYYY-MM'),
    'total', jsonb_build_object(
      'revenue', coalesce((select sum(o.total) from public.orders o where o.status = 'cobrado' and o.created_at >= v_start and o.created_at < v_end), 0),
      'count', (select count(*) from public.orders o where o.status = 'cobrado' and o.created_at >= v_start and o.created_at < v_end)
    ),
    'by_type', (
      select coalesce(
        jsonb_object_agg(t.type, jsonb_build_object('count', t.cnt, 'revenue', t.rev)),
        '{}'::jsonb
      )
      from (
        select o.type, count(*) as cnt, coalesce(sum(o.total), 0) as rev
        from public.orders o
        where o.status = 'cobrado' and o.created_at >= v_start and o.created_at < v_end
        group by o.type
      ) t
    ),
    'weeks', (
      select coalesce(
        jsonb_agg(row_to_json(sub) order by sub.week),
        '[]'::jsonb
      )
      from (
        select
          w.week,
          to_char(bounds.start, 'DD/MM') as start_day,
          to_char(bounds.end, 'DD/MM') as end_day,
          coalesce(agg.cnt, 0) as count,
          coalesce(agg.rev, 0) as revenue
        from generate_series(
          1,
          (select ceil(extract(day from ((p_month + interval '1 month')::date - 1)) / 7.0)::int)
        ) as w(week)
        cross join lateral (
          select
            p_month + (w.week - 1) * 7 as start,
            least(
              p_month + (w.week - 1) * 7 + 6,
              (p_month + interval '1 month')::date - 1
            ) as end
        ) bounds
        left join (
          select
            ceil(extract(day from o.created_at at time zone 'America/Lima') / 7.0)::int as week,
            count(*) as cnt,
            coalesce(sum(o.total), 0) as rev
          from public.orders o
          where o.status = 'cobrado' and o.created_at >= v_start and o.created_at < v_end
          group by 1
        ) agg on agg.week = w.week
        order by w.week
      ) sub
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
        where o.status = 'cobrado' and o.created_at >= v_start and o.created_at < v_end
        group by oi.name
        order by revenue desc
        limit 5
      ) sub
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_reports_month(date) from anon, public;
grant execute on function public.get_reports_month(date) to authenticated;