'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BikeIcon, CloseIcon, MinusIcon, PlusIcon, TableIcon } from '@/components/ui/icons'
import CartPanel from '@/components/orders/cart-panel'

type Category = { id: string; name: string }
export type MenuItem = {
  id: string
  category_id: string | null
  name: string
  price: number
  available: boolean
}
type Table = { id: string; label: string }

type CartItem = { item: MenuItem; quantity: number }

const DELIVERY_FEE = 5

export default function NewOrderPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [orderType, setOrderType] = useState<'mesa' | 'delivery'>('mesa')
  const [tableId, setTableId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [note, setNote] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase.from('categories').select('id, name').order('sort_order', { ascending: true }),
      supabase.from('menu_items').select('id, category_id, name, price, available'),
      supabase.from('tables').select('id, label').order('label'),
    ]).then(([cats, its, tabs]) => {
      if (cats.error || its.error || tabs.error) {
        setDataError('Error al cargar el menú')
        return
      }
      setCategories(cats.data ?? [])
      setItems(its.data ?? [])
      setTables(tabs.data ?? [])
      if (tabs.data?.[0]) setTableId(tabs.data[0].id)
    })
  }, [])

  const itemsByCategory = useMemo(() => {
    return categories.map((category) => ({
      category,
      items: items.filter((i) => i.category_id === category.id && i.available),
    }))
  }, [categories, items])

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, { item, quantity }) => sum + Number(item.price) * quantity, 0),
    [cart]
  )

  const total = subtotal + (orderType === 'delivery' ? DELIVERY_FEE : 0)

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    )
  }

  const handleSubmit = async () => {
    setError(null)

    if (cart.length === 0) {
      setError('Agrega al menos un platillo.')
      return
    }
    if (orderType === 'mesa' && !tableId) {
      setError('Selecciona una mesa.')
      return
    }
    if (orderType === 'delivery' && !customerName.trim()) {
      setError('Indica el nombre del cliente.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc('create_order', {
      p_type: orderType,
      p_table_id: orderType === 'mesa' ? tableId : null,
      p_customer_name: orderType === 'delivery' ? customerName.trim() : null,
      p_note: note.trim() || null,
      p_items: cart.map(({ item, quantity }) => ({
        menu_item_id: item.id,
        quantity,
      })),
    })

    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
      return
    }

    router.push('/orders')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-500">Sala</p>
        <h1 className="page-title mt-0.5">Nuevo pedido</h1>
      </div>

      {dataError ? (
        <p className="text-rose-400">{dataError}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_340px]">
          <div>
            {/* Tipo de pedido */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              {(
                [
                  { type: 'mesa', label: 'En mesa', Icon: TableIcon },
                  { type: 'delivery', label: 'Delivery', Icon: BikeIcon },
                ] as const
              ).map(({ type, label, Icon }) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                    orderType === type
                      ? 'border-ember-500/60 bg-ember-500/10 text-ember-400'
                      : 'border-ink-700 bg-ink-900 text-cream-300 hover:border-ink-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {orderType === 'mesa' ? (
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="input mb-3"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
                className="input mb-3"
              />
            )}

            {/* Chips de categoría (móvil/tablet) */}
            <div className="sticky top-14 z-30 -mx-4 mb-3 bg-ink-950/95 px-4 py-1.5 backdrop-blur md:hidden">
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {itemsByCategory
                  .filter(({ items }) => items.length > 0)
                  .map(({ category }) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        document
                          .getElementById(`cat-${category.id}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                      className="shrink-0 whitespace-nowrap rounded-full border border-ink-700 bg-ink-900 px-3 py-1 text-xs text-cream-300 transition hover:border-ember-500/50 hover:text-ember-400"
                    >
                      {category.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Menú */}
            <div className="space-y-4">
              {itemsByCategory.map(({ category, items: catItems }) => (
                <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-24">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-px w-6 bg-ember-500/60" />
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-400">
                      {category.name}
                    </h2>
                  </div>
                  {catItems.length === 0 ? (
                    <p className="text-sm text-cream-500">Sin platillos disponibles.</p>
                  ) : (
                    <ul className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                      {catItems.map((item) => {
                        const qty = cart.find((c) => c.item.id === item.id)?.quantity ?? 0
                        if (qty === 0) {
                          return (
                            <li key={item.id}>
                              <button
                                onClick={() => addToCart(item)}
                                className="group flex w-full items-center justify-between gap-2 rounded-xl border border-ink-700 bg-ink-900 p-2.5 text-left transition active:scale-[0.99] hover:border-ember-500/60 hover:bg-ink-800"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium text-cream-100">
                                    {item.name}
                                  </span>
                                  <span className="mt-0.5 block font-mono text-xs tabular-nums text-cream-500 group-hover:text-ember-400">
                                    S/{Number(item.price).toFixed(2)}
                                  </span>
                                </span>
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-800 text-ember-400 transition group-hover:border-ember-500/50 group-hover:bg-ember-500 group-hover:text-ink-950">
                                  <PlusIcon className="h-4 w-4" />
                                </span>
                              </button>
                            </li>
                          )
                        }
                        return (
                          <li key={item.id}>
                            <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-ember-500/40 bg-ember-500/[0.06] p-2.5">
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-cream-100">
                                  {item.name}
                                </span>
                                <span className="mt-0.5 block font-mono text-xs tabular-nums text-ember-400">
                                  S/{Number(item.price).toFixed(2)}
                                </span>
                              </span>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-700 text-cream-300 transition active:scale-95 hover:border-ink-600 hover:text-cream-100"
                                  aria-label={`Quitar ${item.name}`}
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="w-5 text-center font-mono text-sm font-semibold text-cream-100">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-ember-500/50 bg-ember-500 text-ink-950 transition active:scale-95 hover:bg-ember-400"
                                  aria-label={`Agregar ${item.name}`}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>

          {/* Carrito (escritorio/tablet) */}
          <aside className="card h-fit overflow-hidden md:sticky md:top-24 hidden md:block">
            <div className="border-b border-ink-800 px-4 py-3">
              <h2 className="font-display text-lg font-semibold tracking-tight text-cream-50">
                Pedido
              </h2>
            </div>
            <div className="p-4">
              <CartPanel
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
                note={note}
                onNoteChange={setNote}
                error={error}
                loading={loading}
                onSubmit={handleSubmit}
                total={total}
                subtotal={subtotal}
                orderType={orderType}
                deliveryFee={DELIVERY_FEE}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Barra inferior móvil: ver pedido */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-950/95 px-4 py-3 backdrop-blur md:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <button
          onClick={() => setShowSheet(true)}
          className="mx-auto flex w-full max-w-md items-center justify-between rounded-xl btn-primary px-4 py-3"
        >
          <span className="text-sm font-semibold">
            Ver pedido · {cart.length} {cart.length === 1 ? 'plato' : 'platos'}
          </span>
          <span className="font-display text-lg font-semibold tabular-nums">S/{total.toFixed(2)}</span>
        </button>
      </div>

      {/* Sheet móvil del pedido */}
      {showSheet && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSheet(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-ink-700 bg-ink-900 shadow-2xl shadow-black/50"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-ink-800 bg-ink-900 px-4 py-3">
              <h2 className="font-display text-lg font-semibold tracking-tight text-cream-50">
                Pedido
              </h2>
              <button
                onClick={() => setShowSheet(false)}
                className="rounded-lg p-1.5 text-cream-500 transition hover:bg-ink-800 hover:text-cream-200"
                aria-label="Cerrar"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <CartPanel
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
                note={note}
                onNoteChange={setNote}
                error={error}
                loading={loading}
                onSubmit={handleSubmit}
                total={total}
                subtotal={subtotal}
                orderType={orderType}
                deliveryFee={DELIVERY_FEE}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}