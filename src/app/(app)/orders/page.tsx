import { createClient } from '@/lib/supabase/server'
import StatusActions from '@/components/orders/status-actions'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: tables } = await supabase.from('tables').select('id, label')
  const tableMap = Object.fromEntries((tables ?? []).map((t) => [t.id, t.label]))

  const { data: orders } = await supabase
    .from('orders')
    .select('id, type, table_id, customer_name, note, status, total, created_at, order_items(id, name, quantity)')
    .order('created_at', { ascending: false })
    .limit(50)

  const STATUS_LABELS: Record<string, string> = {
    pendiente: 'Pendiente',
    en_cocina: 'En cocina',
    listo: 'Listo',
    entregado: 'Entregado',
    cobrado: 'Cobrado',
  }

  const label = (order: { type: 'mesa' | 'delivery'; table_id: string | null; customer_name: string | null }) =>
    order.type === 'mesa'
      ? tableMap[order.table_id ?? ''] ?? 'Mesa'
      : `Delivery · ${order.customer_name ?? ''}`

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Órdenes</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-zinc-500">Aún no hay órdenes.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900">{label(order)}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(order.created_at).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-semibold text-zinc-900">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <ul className="mb-3 space-y-1">
                {order.order_items?.map((item) => (
                  <li key={item.id} className="text-sm text-zinc-600">
                    {item.quantity} × {item.name}
                  </li>
                ))}
              </ul>

              {order.note && (
                <p className="mb-2 rounded-lg bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                  📝 {order.note}
                </p>
              )}

              <StatusActions
                orderId={order.id}
                status={order.status as 'pendiente' | 'en_cocina' | 'listo' | 'entregado' | 'cobrado'}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}