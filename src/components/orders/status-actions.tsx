'use client'

import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/lib/order-status'

const NEXT: Partial<Record<OrderStatus, { label: string; to: OrderStatus }>> = {
  listo: { label: 'Entregar', to: 'entregado' },
  entregado: { label: 'Cobrar', to: 'cobrado' },
}

export default function StatusActions({
  orderId,
  status,
  onChange,
}: {
  orderId: string
  status: OrderStatus
  onChange?: () => void
}) {
  const next = NEXT[status]

  if (!next) return null

  const handle = async () => {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: next.to }).eq('id', orderId)
    if (!error) onChange?.()
  }

  if (next.to === 'cobrado') {
    return (
      <button onClick={handle} className="btn-primary px-4 py-2 text-sm">
        Cobrar
      </button>
    )
  }

  return (
    <button onClick={handle} className="btn-emerald px-4 py-2 text-sm">
      {next.label}
    </button>
  )
}