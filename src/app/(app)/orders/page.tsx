import { createClient } from '@/lib/supabase/server'
import OrderList from '@/components/orders/order-list'

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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="eyebrow">Historial</p>
        <h1 className="page-title mt-1">Órdenes</h1>
        <p className="mt-1 text-sm text-cream-500">
          Estado de comandas y cobro de pedidos.
        </p>
      </div>

      <OrderList orders={orders ?? []} tableMap={tableMap} />
    </div>
  )
}