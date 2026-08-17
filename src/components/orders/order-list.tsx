'use client'

import { useMemo, useState } from 'react'
import StatusActions from '@/components/orders/status-actions'
import { ListIcon } from '@/components/ui/icons'
import { STATUS_ACCENT, STATUS_BADGE, STATUS_LABELS, type OrderStatus } from '@/lib/order-status'

type OrderItem = { id: string; name: string; quantity: number }

type Order = {
  id: string
  type: 'mesa' | 'delivery'
  table_id: string | null
  customer_name: string | null
  note: string | null
  status: OrderStatus
  total: number
  created_at: string
  order_items?: OrderItem[]
}

const FILTERS: { key: OrderStatus | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'en_cocina', label: 'En cocina' },
  { key: 'listo', label: 'Listas' },
  { key: 'entregado', label: 'Entregadas' },
  { key: 'cobrado', label: 'Cobradas' },
]

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function OrderList({
  orders,
  tableMap,
}: {
  orders: Order[]
  tableMap: Record<string, string>
}) {
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos')

  const filtered = useMemo(
    () => (filter === 'todos' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: orders.length }
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1
    return c
  }, [orders])

  const label = (order: Order) =>
    order.type === 'mesa'
      ? tableMap[order.table_id ?? ''] ?? 'Mesa'
      : `Delivery · ${order.customer_name ?? ''}`

  return (
    <>
      <div className="sticky top-14 z-30 -mx-3 mb-4 border-y border-ink-800/80 bg-ink-950/95 px-3 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(({ key, label: l }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`chip ${filter === key ? 'chip-active' : ''}`}
            >
              {l}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  filter === key ? 'bg-ember-500/20 text-ember-300' : 'bg-ink-800 text-cream-500'
                }`}
              >
                {counts[key] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-cream-500">
            <ListIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="font-medium text-cream-200">Sin órdenes {filter !== 'todos' ? STATUS_LABELS[filter].toLowerCase() : ''}</p>
            <p className="mt-1 text-sm text-cream-500">
              {filter === 'todos' ? 'Aún no hay órdenes registradas.' : 'No hay órdenes en este estado.'}
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <li key={order.id} className="card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-800 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-display truncate text-lg font-semibold text-cream-50">
                    {label(order)}
                  </p>
                  <p className="text-xs text-cream-500">{fmtTime(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={STATUS_BADGE[order.status]}>
                    <span className={`badge-dot ${STATUS_ACCENT[order.status]}`} />
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-mono text-base font-semibold tabular-nums text-ember-400">
                    S/{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3">
                {order.order_items && order.order_items.length > 0 ? (
                  <ul className="space-y-1">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex items-baseline justify-between gap-2 text-sm text-cream-300">
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        <span className="font-mono text-xs tabular-nums text-cream-500">
                          ×{item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-cream-500">Sin detalle.</p>
                )}

                {order.note && (
                  <p className="note-highlight mt-3">{order.note}</p>
                )}

                <div className="mt-3 flex justify-end">
                  <StatusActions
                    orderId={order.id}
                    status={order.status}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}