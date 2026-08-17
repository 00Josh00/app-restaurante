'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/modal'
import { PencilIcon } from '@/components/ui/icons'

export default function CategoryForm({ existing }: { existing?: { id: string; name: string } }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(existing?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const result = existing
      ? await supabase.from('categories').update({ name }).eq('id', existing.id)
      : await supabase.from('categories').insert({ name })

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    setOpen(false)
    setName('')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={existing ? 'btn-ghost-icon' : 'btn-primary'}
        title={existing ? 'Editar categoría' : undefined}
        aria-label={existing ? 'Editar categoría' : 'Nueva categoría'}
      >
        {existing ? <PencilIcon className="h-4 w-4" /> : 'Nueva categoría'}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={existing ? 'Editar categoría' : 'Nueva categoría'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="cat-name">
              Nombre
            </label>
            <input
              id="cat-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </>
  )
}