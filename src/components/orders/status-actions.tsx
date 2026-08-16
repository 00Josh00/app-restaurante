'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'pendiente' | 'en_cocina' | 'listo' | 'entregado' | 'cobrado'

const NEXT: Partial<Record<Status, { label: string; to: Status }>> = {
  listo: { label: 'Entregar', to: 'entregado' },
  entregado: { label: 'Cobrar', to: 'cobrado' },
}

export default function StatusActions({ orderId, status }: { orderId: string; status: Status }) {
  const router = useRouter()
  const next = NEXT[status]

  if (!next) return null

  const handle = async () => {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: next.to }).eq('id', orderId)
    if (!error) router.refresh()
  }

  return (
    <button
      onClick={handle}
      className={next.to === 'cobrado' ? 'btn-primary px-3 py-1.5' : 'btn-emerald px-3 py-1.5'}
    >
      {next.label}
    </button>
  )
}