import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChartIcon } from '@/components/ui/icons'

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
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
        Error al cargar los reportes: {error.message}
      </div>
    )
  }

  const r = report as unknown as Report

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2.5">
        <ChartIcon className="h-5 w-5 text-ember-500" />
        <h1 className="page-title">Reportes</h1>
      </div>

      {/* Resumen del día */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-cream-500">Ventas de hoy</p>
          <p className="font-display mt-1 text-4xl font-semibold tabular-nums text-ember-400">
            S/{Number(r.today.revenue).toFixed(2)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-cream-500">Órdenes cobradas hoy</p>
          <p className="font-display mt-1 text-4xl font-semibold tabular-nums text-cream-50">
            {r.today.count}
          </p>
        </div>
      </div>

      {/* Por tipo */}
      <section className="card mb-6 p-5">
        <h2 className="section-title mb-4">Por tipo de pedido (hoy)</h2>
        {Object.keys(r.by_type ?? {}).length === 0 ? (
          <p className="text-sm text-cream-500">Sin ventas hoy.</p>
        ) : (
          <ul className="space-y-2.5">
            {Object.entries(r.by_type).map(([type, data]) => (
              <li key={type} className="flex items-center justify-between text-sm">
                <span className="text-cream-300">{TYPE_LABELS[type] ?? type}</span>
                <span className="text-cream-500">
                  {data.count} órdenes ·{' '}
                  <span className="font-mono font-semibold tabular-nums text-ember-400">
                    S/{Number(data.revenue).toFixed(2)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Últimos 7 días */}
      <section className="card mb-6 p-5">
        <h2 className="section-title mb-4">Últimos 7 días</h2>
        {(r.last_7_days ?? []).length === 0 ? (
          <p className="text-sm text-cream-500">Sin ventas.</p>
        ) : (
          <div className="flex h-44 items-end gap-2">
            {(r.last_7_days ?? []).map((d) => {
              const max = Math.max(...(r.last_7_days ?? []).map((x) => x.revenue), 1)
              const height = Math.round((d.revenue / max) * 100)
              return (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-xs tabular-nums text-cream-400">
                    S/{d.revenue.toFixed(0)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-ember-600 to-ember-400"
                    style={{ height: `${Math.max(height, 3)}%` }}
                  />
                  <span className="text-[10px] uppercase tracking-wide text-cream-500">
                    {new Date(d.day).toLocaleDateString([], { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Top platillos */}
      <section className="card p-5">
        <h2 className="section-title mb-4">Platillos más vendidos (hoy)</h2>
        {(r.top_items ?? []).length === 0 ? (
          <p className="text-sm text-cream-500">Sin ventas hoy.</p>
        ) : (
          <ul className="space-y-2.5">
            {r.top_items.map((item, i) => (
              <li key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3 text-cream-200">
                  <span className="font-display w-5 text-ember-500">{i + 1}</span>
                  {item.name}
                </span>
                <span className="text-cream-500">
                  {item.quantity} unid. ·{' '}
                  <span className="font-mono font-semibold tabular-nums text-ember-400">
                    S/{Number(item.revenue).toFixed(2)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}