'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({
  table,
  id,
  label,
}: {
  table: 'categories' | 'menu_items'
  id: string
  label: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar?`)) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 px-2 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {label}
    </button>
  )
}