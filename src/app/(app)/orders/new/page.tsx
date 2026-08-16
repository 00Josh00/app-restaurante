'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BikeIcon, MinusIcon, PlusIcon, TableIcon } from '@/components/ui/icons'

type Category = { id: string; name: string }
type MenuItem = {
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
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-500">Sala</p>
        <h1 className="page-title mt-1">Nuevo pedido</h1>
      </div>

      {dataError ? (
        <p className="text-rose-400">{dataError}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            {/* Tipo de pedido */}
            <div className="mb-4 grid grid-cols-2 gap-2">
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
                className="input mb-6"
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
                className="input mb-6"
              />
            )}

            {/* Menú */}
            <div className="space-y-8">
              {itemsByCategory.map(({ category, items: catItems }) => (
                <section key={category.id}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-px w-8 bg-ember-500/60" />
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-400">
                      {category.name}
                    </h2>
                  </div>
                  {catItems.length === 0 ? (
                    <p className="text-sm text-cream-500">Sin platillos disponibles.</p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {catItems.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => addToCart(item)}
                            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-left transition hover:border-ember-500/60 hover:bg-ink-800"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-cream-100">
                                {item.name}
                              </span>
                              <span className="mt-0.5 block font-mono text-sm tabular-nums text-cream-500 group-hover:text-ember-400">
                                S/{Number(item.price).toFixed(2)}
                              </span>
                            </span>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-800 text-ember-400 transition group-hover:border-ember-500/50 group-hover:bg-ember-500 group-hover:text-ink-950">
                              <PlusIcon className="h-4 w-4" />
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>

          {/* Carrito */}
          <aside className="card h-fit overflow-hidden lg:sticky lg:top-24">
            <div className="border-b border-ink-800 px-4 py-3">
              <h2 className="font-display text-lg font-semibold tracking-tight text-cream-50">
                Pedido
              </h2>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <p className="text-sm text-cream-500">El pedido está vacío.</p>
              ) : (
                <ul className="mb-4 space-y-2.5">
                  {cart.map(({ item, quantity }) => (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate text-cream-200">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-700 text-cream-400 transition hover:border-ink-600 hover:text-cream-100"
                          aria-label={`Quitar ${item.name}`}
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center font-mono text-cream-100">
                          {quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-700 text-cream-400 transition hover:border-ember-500/60 hover:text-ember-400"
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
                  <span className="font-mono tabular-nums text-cream-200">
                    S/{subtotal.toFixed(2)}
                  </span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cream-400">Delivery</span>
                    <span className="font-mono tabular-nums text-cream-200">
                      S/{DELIVERY_FEE.toFixed(2)}
                    </span>
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
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota (opcional)"
                className="input mb-4"
              />

              {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                className="btn-primary w-full py-2.5"
              >
                {loading ? 'Enviando…' : 'Enviar a cocina'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}