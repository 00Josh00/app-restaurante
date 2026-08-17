'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckIcon } from '@/components/ui/icons'

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

  if (next.to === 'cobrado') {
    return (
      <button onClick={handle} className="btn-primary px-4 py-2 text-sm">
        Cobrar
      </button>
    )
  }

  return (
    <button onClick={handle} className="btn-emerald px-4 py-2 text-sm">
      <CheckIcon className="h-4 w-4" />
      {next.label}
    </button>
  )
}