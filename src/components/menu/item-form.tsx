'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/modal'
import { PencilIcon } from '@/components/ui/icons'

type Item = {
  id: string
  name: string
  description: string | null
  price: number
  available: boolean
}

export default function ItemForm({ categoryId, item }: { categoryId: string; item?: Item }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [price, setPrice] = useState(item ? String(item.price) : '')
  const [available, setAvailable] = useState(item?.available ?? true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Precio inválido')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const payload = {
      name,
      description: description || null,
      price: parsedPrice,
      available,
    }

    const result = item
      ? await supabase.from('menu_items').update(payload).eq('id', item.id)
      : await supabase.from('menu_items').insert({ ...payload, category_id: categoryId })

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    setOpen(false)
    setName('')
    setDescription('')
    setPrice('')
    setAvailable(true)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={item ? 'btn-ghost-icon' : 'btn-ghost px-3 py-1.5'}
        title={item ? 'Editar' : undefined}
        aria-label={item ? 'Editar platillo' : 'Agregar platillo'}
      >
        {item ? <PencilIcon className="h-4 w-4" /> : 'Agregar platillo'}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={item ? 'Editar platillo' : 'Agregar platillo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="item-name">
              Nombre
            </label>
            <input
              id="item-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="item-desc">
              Descripción
            </label>
            <textarea
              id="item-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label" htmlFor="item-price">
              Precio
            </label>
            <input
              id="item-price"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="0.00"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-cream-200">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="h-4 w-4 accent-ember-500"
            />
            Disponible
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </>
  )
}