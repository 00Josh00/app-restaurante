'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

  const total = useMemo(
    () =>
      cart.reduce((sum, { item, quantity }) => sum + Number(item.price) * quantity, 0),
    [cart]
  )

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
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Nuevo pedido</h1>

      {dataError ? (
        <p className="text-red-600">{dataError}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            {/* Tipo de pedido */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              {(['mesa', 'delivery'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`rounded-xl border p-3 text-sm font-medium transition ${
                    orderType === type
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {type === 'mesa' ? '🪑 En mesa' : '🛵 Delivery'}
                </button>
              ))}
            </div>

            {orderType === 'mesa' ? (
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="mb-6 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
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
                className="mb-6 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              />
            )}

            {/* Menú */}
            <div className="space-y-6">
              {itemsByCategory.map(({ category, items: catItems }) => (
                <section key={category.id}>
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {category.name}
                  </h2>
                  {catItems.length === 0 ? (
                    <p className="text-sm text-zinc-400">Sin platillos disponibles.</p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {catItems.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => addToCart(item)}
                            className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:border-zinc-900"
                          >
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                              <p className="text-sm text-zinc-500">
                                ${Number(item.price).toFixed(2)}
                              </p>
                            </div>
                            <span className="rounded-lg bg-zinc-100 px-2 py-1 text-sm">+</span>
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
          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-4 lg:sticky lg:top-4">
            <h2 className="mb-3 font-semibold text-zinc-900">Pedido</h2>

            {cart.length === 0 ? (
              <p className="text-sm text-zinc-500">El pedido está vacío.</p>
            ) : (
              <ul className="mb-4 space-y-2">
                {cart.map(({ item, quantity }) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate text-zinc-800">{item.name}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="rounded bg-zinc-100 px-2 text-zinc-600 hover:bg-zinc-200"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="rounded bg-zinc-100 px-2 text-zinc-600 hover:bg-zinc-200"
                    >
                      +
                    </button>
                    <span className="w-20 text-right font-medium text-zinc-900">
                      ${(Number(item.price) * quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mb-4 flex items-center justify-between border-t border-zinc-200 pt-3">
              <span className="font-medium text-zinc-700">Total</span>
              <span className="text-lg font-semibold text-zinc-900">
                ${total.toFixed(2)}
              </span>
            </div>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (opcional)"
              className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || cart.length === 0}
              className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? 'Enviando…' : 'Enviar a cocina'}
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}