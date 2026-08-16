'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type OrderItem = { id: string; name: string; quantity: number }
type Order = {
  id: string
  type: 'mesa' | 'delivery'
  table_id: string | null
  customer_name: string | null
  note: string | null
  status: 'pendiente' | 'en_cocina' | 'listo' | 'entregado' | 'cobrado'
  created_at: string
  order_items: OrderItem[]
}
type TableMap = Record<string, string>

const STATUS_LABELS: Record<Order['status'], string> = {
  pendiente: 'Pendiente',
  en_cocina: 'En cocina',
  listo: 'Listo',
  entregado: 'Entregado',
  cobrado: 'Cobrado',
}

const STATUS_STYLES: Record<Order['status'], string> = {
  pendiente: 'border-red-300 bg-red-50',
  en_cocina: 'border-amber-300 bg-amber-50',
  listo: 'border-green-300 bg-green-50',
  entregado: 'border-zinc-200 bg-white',
  cobrado: 'border-zinc-200 bg-white',
}

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
            fetchOrderWithItems(changed.id).then((full) => {
              if (full) {
                setOrders((prev) =>
                  prev.map((o) => (o.id === full.id ? full : o))
                )
              }
            })
            return
          }

          if (payload.eventType === 'UPDATE' && changed) {
            setOrders((prev) => {
              if (changed.status === 'listo' || changed.status === 'entregado') {
                // mantener visibles los listos; los entregados desaparecen
                if (changed.status === 'entregado') {
                  return prev.filter((o) => o.id !== changed.id)
                }
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

  const updateStatus = async (id: string, status: Order['status']) => {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) console.error(error)
  }

  const orderLabel = (order: Order) => {
    if (order.type === 'mesa') return tables[order.table_id ?? ''] ?? 'Mesa'
    return `Delivery · ${order.customer_name ?? ''}`
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Cocina</h1>

      {loading ? (
        <p className="text-zinc-500">Cargando…</p>
      ) : orders.length === 0 ? (
        <p className="text-zinc-500">No hay pedidos.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const isNew = newOrderIds.includes(order.id)
            return (
              <li
                key={order.id}
                className={`rounded-2xl border-2 p-4 ${STATUS_STYLES[order.status]} ${
                  isNew ? 'animate-pulse' : ''
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-900">{orderLabel(order)}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-zinc-700">
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <ul className="mb-3 space-y-1">
                  {order.order_items?.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm text-zinc-800">
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.note && (
                  <p className="mb-3 rounded-lg bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    📝 {order.note}
                  </p>
                )}

                <div className="flex gap-2">
                  {order.status === 'pendiente' && (
                    <button
                      onClick={() => updateStatus(order.id, 'en_cocina')}
                      className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
                    >
                      Empezar
                    </button>
                  )}
                  {order.status === 'en_cocina' && (
                    <button
                      onClick={() => updateStatus(order.id, 'listo')}
                      className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white transition hover:bg-green-500"
                    >
                      Listo
                    </button>
                  )}
                  {order.status === 'listo' && (
                    <button
                      onClick={() => updateStatus(order.id, 'entregado')}
                      className="flex-1 rounded-lg bg-zinc-600 py-2 text-sm font-medium text-white transition hover:bg-zinc-500"
                    >
                      Entregado
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}