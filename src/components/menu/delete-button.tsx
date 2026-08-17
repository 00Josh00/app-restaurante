'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/modal'
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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost-icon text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        title={label}
        aria-label={label}
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={label}>
        <p className="text-sm text-cream-300">
          ¿Estás seguro de eliminar este elemento? Esta acción no se puede deshacer.
        </p>
        {error && <p className="alert-error mt-3">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={loading} className="btn-danger px-4 py-2">
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </>
  )
}