import { createClient } from '@/lib/supabase/server'
import OrderList from '@/components/orders/order-list'
import type { OrdersResult } from '@/components/orders/order-list'
import type { OrderStatus } from '@/lib/order-status'

export const dynamic = 'force-dynamic'

const ORDER_STATUSES: OrderStatus[] = ['pendiente', 'en_cocina', 'listo', 'entregado', 'cobrado']
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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const sp = await searchParams
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus)
    ? (sp.status as OrderStatus)
    : null
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const { data } = await supabase.rpc('get_orders', {
    p_status: status,
    p_limit: PAGE_SIZE,
    p_offset: offset,
  })

  const result = (data as OrdersResult | null) ?? { orders: [], counts: {}, total: 0 }
  const orders = (result.orders ?? []).map((order) => ({
    ...order,
    time_label: fmtTime(order.created_at),
  }))

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="eyebrow">Historial</p>
        <h1 className="page-title mt-1">Órdenes</h1>
        <p className="mt-1 text-sm text-cream-500">
          Estado de comandas y cobro de pedidos.
        </p>
      </div>

      <OrderList
        orders={orders}
        counts={result.counts ?? {}}
        total={result.total ?? 0}
        status={status}
        page={page}
      />
    </div>
  )
}