import { createClient } from '@/lib/supabase/server'
import StatusActions from '@/components/orders/status-actions'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_cocina: 'En cocina',
  listo: 'Listo',
  entregado: 'Entregado',
  cobrado: 'Cobrado',
}

const STATUS_BADGE: Record<string, string> = {
  pendiente: 'badge-rose',
  en_cocina: 'badge-amber',
  listo: 'badge-emerald',
  entregado: 'badge-neutral',
  cobrado: 'badge-neutral',
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: tables } = await supabase.from('tables').select('id, label')
  const tableMap = Object.fromEntries((tables ?? []).map((t) => [t.id, t.label]))

  const { data: orders } = await supabase
    .from('orders')
    .select('id, type, table_id, customer_name, note, status, total, created_at, order_items(id, name, quantity)')
    .order('created_at', { ascending: false })
    .limit(50)

  const label = (order: { type: 'mesa' | 'delivery'; table_id: string | null; customer_name: string | null }) =>
    order.type === 'mesa'
      ? tableMap[order.table_id ?? ''] ?? 'Mesa'
      : `Delivery · ${order.customer_name ?? ''}`

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-500">Historial</p>
        <h1 className="page-title mt-1">Órdenes</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="card p-10 text-center text-cream-500">Aún no hay órdenes.</div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-semibold text-cream-50">
                    {label(order)}
                  </p>
                  <p className="text-xs text-cream-500">
                    {new Date(order.created_at).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={STATUS_BADGE[order.status] ?? 'badge-neutral'}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span className="font-mono text-base font-semibold tabular-nums text-ember-400">
                    S/{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <ul className="mb-3 space-y-1">
                {order.order_items?.map((item) => (
                  <li key={item.id} className="text-sm text-cream-300">
                    <span className="font-mono text-xs tabular-nums text-cream-500">
                      {item.quantity} ×{' '}
                    </span>
                    {item.name}
                  </li>
                ))}
              </ul>

              {order.note && (
                <p className="mb-3 rounded-lg border border-ember-500/30 bg-ember-500/10 px-2.5 py-1.5 text-xs text-ember-300">
                  {order.note}
                </p>
              )}

              <div className="flex justify-end">
                <StatusActions
                  orderId={order.id}
                  status={order.status as 'pendiente' | 'en_cocina' | 'listo' | 'entregado' | 'cobrado'}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}