'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AvailableToggle({
  item,
}: {
  item: { id: string; name: string; available: boolean }
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('menu_items')
      .update({ available: !item.available })
      .eq('id', item.id)
    if (!error) {
      router.refresh()
    } else {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 disabled:opacity-50 ${
        item.available
          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
          : 'border-rose-500/30 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
      }`}
      aria-label={
        item.available
          ? `Marcar ${item.name} como agotado`
          : `Marcar ${item.name} como disponible`
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.available ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      {item.available ? 'Disponible' : 'Agotado'}
    </button>
  )
}
