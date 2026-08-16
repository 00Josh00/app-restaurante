'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TrashIcon } from '@/components/ui/icons'

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
      className="btn-danger px-2.5 py-1.5"
      title={label}
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  )
}