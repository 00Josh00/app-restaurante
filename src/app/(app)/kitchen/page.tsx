'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { STATUS_ACCENT, STATUS_BADGE, STATUS_LABELS, type OrderStatus } from '@/lib/order-status'
import { BellIcon, CheckIcon, ClockIcon, PlayIcon, UtensilsIcon } from '@/components/ui/icons'

type OrderItem = { id: string; name: string; quantity: number }
type Order = {
  id: string
  type: 'mesa' | 'delivery'
  table_id: string | null
  customer_name: string | null
  note: string | null
  status: OrderStatus
  created_at: string
  order_items: OrderItem[]
}
type TableMap = Record<string, string>

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    // audio no disponible
  }
}

function Elapsed({ from }: { from: string }) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    const update = () => setNow(Date.now())
    update()
    const t = setInterval(update, 30_000)
    return () => clearInterval(t)
  }, [])

  const mins = Math.max(0, Math.floor((now - new Date(from).getTime()) / 60_000))
  if (mins < 1) return <span>recién</span>
  return <span>{mins} min</span>
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<TableMap>({})
  const [loading, setLoading] = useState(true)
  const [newOrderIds, setNewOrderIds] = useState<string[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchOrderWithItems = async (id: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('id, type, table_id, customer_name, note, status, created_at, order_items(id, name, quantity)')
      .eq('id', id)
      .single()
    return data as unknown as Order | null
  }

  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase.from('tables').select('id, label'),
      supabase
        .from('orders')
        .select('id, type, table_id, customer_name, note, status, created_at, order_items(id, name, quantity)')
        .or('status.in.(pendiente,en_cocina,listo)')
        .order('created_at', { ascending: false }),
    ]).then(([tablesRes, ordersRes]) => {
      if (tablesRes.data) {
        setTables(Object.fromEntries(tablesRes.data.map((t) => [t.id, t.label])))
      }
      if (ordersRes.error) {
        console.error(ordersRes.error)
      } else {
        setOrders((ordersRes.data ?? []) as unknown as Order[])
      }
      setLoading(false)
    })

    const channel = supabase
      .channel('kitchen-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const changed = payload.new as Order | null

          if (payload.eventType === 'INSERT' && changed) {
            setOrders((prev) => [changed, ...prev])
            setNewOrderIds((prev) => [...prev, changed.id])
            playBeep()
            setTimeout(() => {
              setNewOrderIds((prev) => prev.filter((id) => id !== changed.id))
            }, 6000)
            fetchOrderWithItems(changed.id)
              .then((full) => {
                if (full) {
                  setOrders((prev) => prev.map((o) => (o.id === full.id ? full : o)))
                }
              })
              .catch(() => {
                // Sin detalle: la tarjeta se muestra con los items del payload
              })
            return
          }

          if (payload.eventType === 'UPDATE' && changed) {
            setOrders((prev) => {
              if (changed.status === 'entregado' || changed.status === 'cobrado') {
                return prev.filter((o) => o.id !== changed.id)
              }
              const exists = prev.some((o) => o.id === changed.id)
              if (exists) {
                return prev.map((o) => (o.id === changed.id ? { ...o, ...changed } : o))
              }
              return [changed, ...prev]
            })
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [])

  const updateStatus = async (id: string, status: OrderStatus) => {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) console.error(error)
  }

  const orderLabel = (order: Order) => {
    if (order.type === 'mesa') return tables[order.table_id ?? ''] ?? 'Mesa'
    return `Delivery · ${order.customer_name ?? ''}`
  }

  const pendingCount = orders.filter((o) => o.status === 'pendiente').length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 eyebrow">
            <UtensilsIcon className="h-4 w-4" /> Cocina
          </p>
          <h1 className="page-title mt-1">Órdenes en vivo</h1>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="badge-rose">
              {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
            </span>
          )}
          <span className="badge-amber">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ember-500" />
            </span>
            En vivo
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton mb-3 h-5 w-2/3" />
              <div className="skeleton mb-2 h-3 w-full" />
              <div className="skeleton mb-2 h-3 w-full" />
              <div className="skeleton h-9 w-full" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-cream-500">
            <BellIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-medium text-cream-200">No hay pedidos esperando</p>
            <p className="mt-1 text-sm text-cream-500">
              Los nuevos pedidos aparecerán aquí en tiempo real.
            </p>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {orders.map((order) => {
            const isNew = newOrderIds.includes(order.id)
            return (
              <li
                key={order.id}
                className={`card overflow-hidden p-0 ${isNew ? 'animate-pulse ring-2 ring-ember-500/40' : ''}`}
              >
                <div className={`h-1 w-full ${STATUS_ACCENT[order.status]}`} />
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display truncate text-lg font-semibold text-cream-50">
                        {orderLabel(order)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-cream-500">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <Elapsed from={order.created_at} />
                      </p>
                    </div>
                    <span className={STATUS_BADGE[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <ul className="mb-3 space-y-1.5">
                    {order.order_items?.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-2 rounded-lg bg-ink-950/60 px-2.5 py-1.5 text-sm text-cream-200"
                      >
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        <span className="font-mono text-xs font-semibold tabular-nums text-ember-400">
                          ×{item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.note && (
                    <p className="note-highlight mb-3">{order.note}</p>
                  )}

                  <div className="flex gap-2">
                    {order.status === 'pendiente' && (
                      <button
                        onClick={() => updateStatus(order.id, 'en_cocina')}
                        className="btn-primary flex-1 py-2.5"
                      >
                        <PlayIcon className="h-4 w-4" />
                        Empezar
                      </button>
                    )}
                    {order.status === 'en_cocina' && (
                      <button
                        onClick={() => updateStatus(order.id, 'listo')}
                        className="btn-emerald flex-1 py-2.5"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Listo
                      </button>
                    )}
                    {order.status === 'listo' && (
                      <button
                        onClick={() => updateStatus(order.id, 'entregado')}
                        className="btn-ghost flex-1 py-2.5"
                      >
                        Entregado
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}