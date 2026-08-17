'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatusActions from '@/components/orders/status-actions'
import { ListIcon } from '@/components/ui/icons'
import { STATUS_ACCENT, STATUS_BADGE, STATUS_LABELS, type OrderStatus } from '@/lib/order-status'

type OrderItem = { id: string; name: string; quantity: number }

type Order = {
  id: string
  type: 'mesa' | 'delivery'
  table_id: string | null
  table_label: string | null
  customer_name: string | null
  note: string | null
  status: OrderStatus
  total: number
  created_at: string
  order_items?: OrderItem[]
}

type OrdersResult = {
  orders: Order[]
  counts: Record<string, number>
  total: number
}

const FILTERS: { key: OrderStatus | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'en_cocina', label: 'En cocina' },
  { key: 'listo', label: 'Listas' },
  { key: 'entregado', label: 'Entregadas' },
  { key: 'cobrado', label: 'Cobradas' },
]

const PAGE_SIZE = 50

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const offsetRef = useRef(0)
  const requestRef = useRef(0)

  const runQuery = useCallback(
    (status: OrderStatus | 'todos', offset: number, append: boolean) => {
      const reqId = ++requestRef.current
      const supabase = createClient()
      return supabase
        .rpc('get_orders', {
          p_status: status === 'todos' ? null : status,
          p_limit: PAGE_SIZE,
          p_offset: offset,
        })
        .then(({ data, error: rpcError }) => {
          if (reqId !== requestRef.current) return
          setLoading(false)
          if (rpcError) {
            setError(rpcError.message)
            return
          }
          setError(null)
          if (data) {
            const parsed = data as OrdersResult
            setOrders((prev) =>
              append ? [...prev, ...(parsed.orders ?? [])] : (parsed.orders ?? [])
            )
            setCounts(parsed.counts ?? {})
            setTotal(parsed.total ?? 0)
          }
        })
    },
    []
  )

  useEffect(() => {
    offsetRef.current = 0
    runQuery(filter, 0, false)
  }, [filter, runQuery])

  const reload = () => {
    setLoading(true)
    offsetRef.current = 0
    runQuery(filter, 0, false)
  }

  const onFilter = (key: OrderStatus | 'todos') => {
    if (key === filter) return
    setLoading(true)
    offsetRef.current = 0
    setFilter(key)
  }

  const loadMore = () => {
    const next = offsetRef.current + PAGE_SIZE
    offsetRef.current = next
    runQuery(filter, next, true)
  }

  const label = (order: Order) =>
    order.type === 'mesa'
      ? order.table_label ?? 'Mesa'
      : `Delivery · ${order.customer_name ?? ''}`

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="eyebrow">Historial</p>
        <h1 className="page-title mt-1">Órdenes</h1>
        <p className="mt-1 text-sm text-cream-500">Estado de comandas y cobro de pedidos.</p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label: l }) => (
          <button
            key={key}
            onClick={() => onFilter(key)}
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

      {error && <p className="alert-error mb-4">{error}</p>}

      {loading && orders.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-28 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-cream-500">
            <ListIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="font-medium text-cream-200">
              Sin órdenes {filter !== 'todos' ? STATUS_LABELS[filter].toLowerCase() : ''}
            </p>
            <p className="mt-1 text-sm text-cream-500">
              {filter === 'todos'
                ? 'Aún no hay órdenes registradas.'
                : 'No hay órdenes en este estado.'}
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id} className="card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-800 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-display truncate text-base font-semibold text-cream-50">
                    {label(order)}
                  </p>
                  <p className="text-xs text-cream-500">{fmtTime(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={STATUS_BADGE[order.status]}>
                    <span className={`badge-dot ${STATUS_ACCENT[order.status]}`} />
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-ember-400">
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

                {order.note && <p className="note-highlight mt-3">{order.note}</p>}

                <div className="mt-3 flex justify-end">
                  <StatusActions orderId={order.id} status={order.status} onChange={reload} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && orders.length < total && (
        <button onClick={loadMore} className="btn-ghost mx-auto mt-4 block px-6 py-2.5">
          Cargar más
        </button>
      )}
    </div>
  )
}