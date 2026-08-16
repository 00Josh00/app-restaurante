'use client'

import { MinusIcon, PlusIcon } from '@/components/ui/icons'
import type { MenuItem } from '@/app/(app)/orders/new/page'

type CartItem = { item: MenuItem; quantity: number }

export default function CartPanel({
  cart,
  onAdd,
  onRemove,
  note,
  onNoteChange,
  error,
  loading,
  onSubmit,
  total,
  subtotal,
  orderType,
  deliveryFee,
}: {
  cart: CartItem[]
  onAdd: (item: MenuItem) => void
  onRemove: (id: string) => void
  note: string
  onNoteChange: (value: string) => void
  error: string | null
  loading: boolean
  onSubmit: () => void
  total: number
  subtotal: number
  orderType: 'mesa' | 'delivery'
  deliveryFee: number
}) {
  return (
    <>
      {cart.length === 0 ? (
        <p className="text-sm text-cream-500">El pedido está vacío.</p>
      ) : (
        <ul className="mb-4 space-y-2.5">
          {cart.map(({ item, quantity }) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-cream-200">{item.name}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onRemove(item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-700 text-cream-400 transition active:scale-95 hover:border-ink-600 hover:text-cream-100"
                  aria-label={`Quitar ${item.name}`}
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center font-mono text-cream-100">{quantity}</span>
                <button
                  onClick={() => onAdd(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-700 text-cream-400 transition active:scale-95 hover:border-ember-500/60 hover:text-ember-400"
                  aria-label={`Agregar ${item.name}`}
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="w-20 text-right font-mono font-medium tabular-nums text-cream-100">
                S/{(Number(item.price) * quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-4 space-y-1.5 border-t border-ink-800 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cream-400">Subtotal</span>
          <span className="font-mono tabular-nums text-cream-200">S/{subtotal.toFixed(2)}</span>
        </div>
        {orderType === 'delivery' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-cream-400">Delivery</span>
            <span className="font-mono tabular-nums text-cream-200">S/{deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-medium text-cream-100">Total</span>
          <span className="font-display text-2xl font-semibold tabular-nums text-ember-400">
            S/{total.toFixed(2)}
          </span>
        </div>
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Nota (opcional)"
        className="input mb-4"
      />

      {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={loading || cart.length === 0}
        className="btn-primary w-full py-2.5"
      >
        {loading ? 'Enviando…' : 'Enviar a cocina'}
      </button>
    </>
  )
}