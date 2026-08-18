'use client'

import { MinusIcon, PlusIcon } from '@/components/ui/icons'
import type { CartItem, MenuItem } from '@/lib/order-types'

const soles = (n: number) => `S/${n.toFixed(2)}`

export function CartItems({
  cart,
  onAdd,
  onRemove,
}: {
  cart: CartItem[]
  onAdd: (item: MenuItem) => void
  onRemove: (id: string) => void
}) {
  if (cart.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-700 px-4 py-6 text-center text-sm text-cream-500">
        El pedido está vacío. Toca un platillo para agregarlo.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {cart.map(({ item, quantity }) => (
        <li
          key={item.id}
          className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2 text-sm"
        >
          <span className="min-w-0 flex-1 truncate font-medium text-cream-100">
            {item.name}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => onRemove(item.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-700 text-cream-400 transition hover:border-ink-600 hover:text-cream-100 active:scale-95"
              aria-label={`Quitar ${item.name}`}
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center font-mono tabular-nums text-cream-100">
              {quantity}
            </span>
            <button
              onClick={() => onAdd(item)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-ember-500/50 bg-ember-500/15 text-ember-400 transition hover:bg-ember-500 hover:text-ink-950 active:scale-95"
              aria-label={`Agregar ${item.name}`}
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="w-20 shrink-0 text-right font-mono font-medium tabular-nums text-cream-100">
            {soles(Number(item.price) * quantity)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function CartFooter({
  subtotal,
  total,
  orderType,
  deliveryFee,
  note,
  onNoteChange,
  error,
  loading,
  disabled,
  onSubmit,
}: {
  subtotal: number
  total: number
  orderType: 'mesa' | 'delivery'
  deliveryFee: number | null
  note: string
  onNoteChange: (value: string) => void
  error: string | null
  loading: boolean
  disabled: boolean
  onSubmit: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cream-400">Subtotal</span>
          <span className="font-mono tabular-nums text-cream-200">{soles(subtotal)}</span>
        </div>
        {orderType === 'delivery' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-cream-400">Delivery</span>
            <span className="font-mono tabular-nums text-cream-200">
              {deliveryFee != null ? soles(deliveryFee) : '—'}
            </span>
          </div>
        )}
        <div className="flex items-end justify-between pt-1.5">
          <span className="text-sm font-semibold text-cream-100">Total</span>
          <span className="font-display text-2xl font-semibold tabular-nums text-ember-400">
            {soles(total)}
          </span>
        </div>
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Nota para la cocina (opcional)"
        className="input"
      />

      {error && <p className="alert-error">{error}</p>}

      <button onClick={onSubmit} disabled={disabled} className="btn-primary w-full py-3">
        {loading ? 'Enviando…' : 'Enviar a cocina'}
      </button>
    </div>
  )
}
