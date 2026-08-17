'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import StatusActions from '@/components/orders/status-actions'
import { ListIcon } from '@/components/ui/icons'
import { STATUS_ACCENT, STATUS_BADGE, STATUS_LABELS, type OrderStatus } from '@/lib/order-status'

type OrderItem = { id: string; name: string; quantity: number }

export type Order = {
  id: string
  type: 'mesa' | 'delivery'
  table_id: string | null
  table_label: string | null
  customer_name: string | null
  note: string | null
  status: OrderStatus
  total: number
  created_at: string
  time_label: string
  order_items?: OrderItem[]
}

export type OrdersResult = {
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

export default function OrderList({
  orders,
  counts,
  total,
  status,
  page,
}: {
  orders: Order[]
  counts: Record<string, number>
  total: number
  status: OrderStatus | null
  page: number
}) {
  const [extra, setExtra] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const [prevOrders, setPrevOrders] = useState(orders)
  if (prevOrders !== orders) {
    setPrevOrders(orders)
    setExtra([])
  }

  const all = [...orders, ...extra]

  const loadMore = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: result } = await supabase.rpc('get_orders', {
      p_status: status,
      p_limit: PAGE_SIZE,
      p_offset: (page - 1) * PAGE_SIZE + extra.length,
    })
    if (result) {
      const parsed = result as OrdersResult
      const next = (parsed.orders ?? []).map((o) => ({ ...o, time_label: fmtTime(o.created_at) }))
      setExtra((prev) => [...prev, ...next])
    }
    setLoading(false)
  }

  const hrefFor = (key: OrderStatus | 'todos') =>
    key === 'todos' ? '/orders' : `/orders?status=${key}`

  const countFor = (key: OrderStatus | 'todos') => counts[key] ?? 0

  const label = (order: Order) =>
    order.type === 'mesa'
      ? order.table_label ?? 'Mesa'
      : `Delivery · ${order.customer_name ?? ''}`

  return (
    <>
      <div className="sticky top-14 z-30 -mx-3 mb-4 border-b border-ink-800 bg-ink-950/95 px-3 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(({ key, label: l }) => {
            const active = (key === 'todos' && status === null) || key === status
            return (
              <Link
                key={key}
                href={hrefFor(key)}
                className={`chip ${active ? 'chip-active' : ''}`}
              >
                {l}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    active ? 'bg-ember-500/20 text-ember-300' : 'bg-ink-800 text-cream-500'
                  }`}
                >
                  {countFor(key)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {all.length === 0 ? (
        <div className="empty-state">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-cream-500">
            <ListIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="font-medium text-cream-200">
              Sin órdenes {status ? STATUS_LABELS[status].toLowerCase() : ''}
            </p>
            <p className="mt-1 text-sm text-cream-500">
              {status
                ? 'No hay órdenes en este estado.'
                : 'Aún no hay órdenes registradas.'}
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {all.map((order) => (
            <li key={order.id} className="card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-800 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-display truncate text-base font-semibold text-cream-50">
                    {label(order)}
                  </p>
                  <p className="text-xs text-cream-500">{order.time_label}</p>
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
                  <StatusActions orderId={order.id} status={order.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && all.length < total && (
        <button onClick={loadMore} className="btn-ghost mx-auto mt-4 block px-6 py-2.5">
          Cargar más
        </button>
      )}
    </>
  )
}