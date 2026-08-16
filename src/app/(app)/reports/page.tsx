import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Report = {
  today: { revenue: number; count: number }
  by_type: Record<'mesa' | 'delivery', { count: number; revenue: number }>
  top_items: { name: string; quantity: number; revenue: number }[]
  last_7_days: { day: string; revenue: number }[]
}

const TYPE_LABELS: Record<string, string> = {
  mesa: 'Mesa',
  delivery: 'Delivery',
}

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('role').single()
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: report, error } = await supabase.rpc('get_reports')

  if (error) {
    return <p className="text-red-600">Error al cargar los reportes: {error.message}</p>
  }

  const r = report as unknown as Report

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Reportes</h1>

      {/* Resumen del día */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Ventas de hoy</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900">
            ${Number(r.today.revenue).toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Órdenes cobradas hoy</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900">{r.today.count}</p>
        </div>
      </div>

      {/* Por tipo */}
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-zinc-900">Por tipo de pedido (hoy)</h2>
        {Object.keys(r.by_type ?? {}).length === 0 ? (
          <p className="text-sm text-zinc-500">Sin ventas hoy.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(r.by_type).map(([type, data]) => (
              <li key={type} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700">{TYPE_LABELS[type] ?? type}</span>
                <span className="text-zinc-500">
                  {data.count} órdenes · <span className="font-medium text-zinc-900">${Number(data.revenue).toFixed(2)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Últimos 7 días */}
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-zinc-900">Últimos 7 días</h2>
        <div className="flex h-40 items-end gap-2">
          {(r.last_7_days ?? []).map((d) => {
            const max = Math.max(...(r.last_7_days ?? []).map((x) => x.revenue), 1)
            const height = Math.round((d.revenue / max) * 100)
            return (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs text-zinc-600">${d.revenue.toFixed(0)}</span>
                <div
                  className="w-full rounded-t-md bg-zinc-900"
                  style={{ height: `${Math.max(height, 3)}%` }}
                />
                <span className="text-[10px] text-zinc-400">
                  {new Date(d.day).toLocaleDateString([], { weekday: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Top platillos */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-zinc-900">Platillos más vendidos (hoy)</h2>
        {(r.top_items ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">Sin ventas hoy.</p>
        ) : (
          <ul className="space-y-2">
            {r.top_items.map((item, i) => (
              <li key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-700">
                  <span className="text-zinc-400">{i + 1}.</span>
                  {item.name}
                </span>
                <span className="text-zinc-500">
                  {item.quantity} unid. · <span className="font-medium text-zinc-900">${Number(item.revenue).toFixed(2)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}