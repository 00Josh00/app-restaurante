import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MonthPicker from '@/components/reports/month-picker'
import { ChartIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

type Report = {
  month: string
  total: { revenue: number; count: number }
  by_type: Record<'mesa' | 'delivery', { count: number; revenue: number }>
  weeks: { week: number; start_day: string; end_day: string; count: number; revenue: number }[]
  top_items: { name: string; quantity: number; revenue: number }[]
}

const TYPE_LABELS: Record<string, string> = {
  mesa: 'Mesa',
  delivery: 'Delivery',
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams

  const limaNow = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const defaultMonth = limaNow.slice(0, 7)
  const raw = params.month ?? defaultMonth
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) ? raw : defaultMonth

  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('role').single()
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: report, error } = await supabase.rpc('get_reports_month', {
    p_month: `${month}-01`,
  })

  const [y, m] = month.split('-').map(Number)
  const monthLabel = cap(
    new Date(y, m - 1, 1)
      .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
      .replace(' de ', ' ')
  )

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
        Error al cargar los reportes: {error.message}
      </div>
    )
  }

  const r = report as unknown as Report
  const maxWeek = Math.max(...(r.weeks ?? []).map((w) => w.revenue), 1)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ember-500">
            <ChartIcon className="h-4 w-4" /> Reportes
          </p>
          <h1 className="page-title mt-1">{monthLabel}</h1>
        </div>
        <MonthPicker value={month} />
      </div>

      {/* Resumen del mes */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-cream-500">Ventas del mes</p>
          <p className="font-display mt-1 text-4xl font-semibold tabular-nums text-ember-400">
            S/{Number(r.total.revenue).toFixed(2)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-cream-500">Órdenes cobradas</p>
          <p className="font-display mt-1 text-4xl font-semibold tabular-nums text-cream-50">
            {r.total.count}
          </p>
        </div>
      </div>

      {/* Por semana */}
      <section className="card mb-6 p-5">
        <h2 className="section-title mb-4">Ventas por semana</h2>
        {(r.weeks ?? []).length === 0 || (r.weeks ?? []).every((w) => w.revenue === 0) ? (
          <p className="text-sm text-cream-500">Sin ventas en este mes.</p>
        ) : (
          <ul className="space-y-4">
            {r.weeks.map((w) => {
              const pct = Math.round((w.revenue / maxWeek) * 100)
              return (
                <li key={w.week}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium text-cream-100">
                      Semana {w.week}
                      <span className="ml-2 font-normal text-cream-500">
                        {w.start_day}–{w.end_day}
                      </span>
                    </span>
                    <span className="shrink-0 text-cream-500">
                      {w.count} {w.count === 1 ? 'orden' : 'órdenes'}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-ember-600 to-ember-400 transition-all"
                        style={{ width: `${w.revenue > 0 ? Math.max(pct, 4) : 0}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right font-mono text-sm tabular-nums text-ember-400">
                      S/{Number(w.revenue).toFixed(2)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Por tipo */}
      <section className="card mb-6 p-5">
        <h2 className="section-title mb-4">Por tipo de pedido</h2>
        {Object.keys(r.by_type ?? {}).length === 0 ? (
          <p className="text-sm text-cream-500">Sin ventas en este mes.</p>
        ) : (
          <ul className="space-y-2.5">
            {Object.entries(r.by_type).map(([type, data]) => (
              <li key={type} className="flex items-center justify-between text-sm">
                <span className="text-cream-300">{TYPE_LABELS[type] ?? type}</span>
                <span className="text-cream-500">
                  {data.count} {data.count === 1 ? 'orden' : 'órdenes'} ·{' '}
                  <span className="font-mono font-semibold tabular-nums text-ember-400">
                    S/{Number(data.revenue).toFixed(2)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Top platillos */}
      <section className="card p-5">
        <h2 className="section-title mb-4">Platillos más vendidos</h2>
        {(r.top_items ?? []).length === 0 ? (
          <p className="text-sm text-cream-500">Sin ventas en este mes.</p>
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