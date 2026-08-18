'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { CartItem, MenuItem } from '@/lib/order-types'
import {
  BikeIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  ShoppingBagIcon,
  TableIcon,
} from '@/components/ui/icons'
import { CartFooter, CartItems } from '@/components/orders/cart-panel'

type Category = { id: string; name: string }
type Table = { id: string; label: string }

const soles = (n: number) => `S/${n.toFixed(2)}`

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
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [showSheet, setShowSheet] = useState(false)
  const [query, setQuery] = useState('')
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Solo mesero o admin toma pedidos
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setRole(profile?.role ?? null)
      if (profile?.role !== 'waiter' && profile?.role !== 'admin') {
        router.replace('/dashboard')
      }
    })

    Promise.all([
      supabase.from('categories').select('id, name').order('sort_order', { ascending: true }),
      supabase.from('menu_items').select('id, category_id, name, price, available'),
      supabase.from('tables').select('id, label').order('label'),
      supabase.rpc('get_delivery_fee'),
    ]).then(([cats, its, tabs, fee]) => {
      setLoading(false)
      if (cats.error || its.error || tabs.error) {
        setDataError('Error al cargar el menú')
        return
      }
      setCategories(cats.data ?? [])
      setItems(its.data ?? [])
      setTables(tabs.data ?? [])
      if (fee.data != null) setDeliveryFee(Number(fee.data))
      if (tabs.data?.[0]) setTableId(tabs.data[0].id)
    })
  }, [router])

  const itemsByCategory = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories
      .map((category) => ({
        category,
        items: items.filter(
          (i) =>
            i.category_id === category.id &&
            i.available &&
            (q === '' || i.name.toLowerCase().includes(q))
        ),
      }))
      .filter(({ items }) => items.length > 0)
  }, [categories, items, query])

  const subtotal = useMemo(
    () => cart.reduce((sum, { item, quantity }) => sum + Number(item.price) * quantity, 0),
    [cart]
  )

  const total = subtotal + (orderType === 'delivery' ? (deliveryFee ?? 0) : 0)

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id)
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
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

  // Mientras se valida el rol (o ya se redirige), no se pinta nada
  if (role !== null && role !== 'waiter' && role !== 'admin') {
    return null
  }

  return (
    <div className="mx-auto max-w-5xl overflow-x-hidden">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="page-title">Nuevo pedido</h1>
        <span className="badge-neutral">
          <ShoppingBagIcon className="h-3.5 w-3.5" />
          {cart.length} {cart.length === 1 ? 'plato' : 'platos'}
        </span>
      </div>

      {dataError ? (
        <div className="alert-error">{dataError}</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {/* Barra de control única (móvil y desktop) */}
            <div className="sticky top-14 z-30 -mx-3 mb-3 border-b border-ink-800/80 bg-ink-950/95 px-3 py-2 backdrop-blur-md md:mx-0 md:px-0 md:py-2.5">
              {/* Tipo + mesa/cliente */}
              <div className="mb-2 flex gap-2">
                <div className="grid shrink-0 grid-cols-2 gap-1 rounded-xl border border-ink-800 bg-ink-900/60 p-0.5">
                  {(
                    [
                      { type: 'mesa', label: 'Mesa', Icon: TableIcon },
                      { type: 'delivery', label: 'Delivery', Icon: BikeIcon },
                    ] as const
                  ).map(({ type, label, Icon }) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition active:scale-[0.98] ${
                        orderType === type
                          ? 'bg-ember-500 text-ink-950'
                          : 'text-cream-300 hover:text-cream-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
                {orderType === 'mesa' ? (
                  <select
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    className="input h-9 min-w-0 flex-1 text-xs"
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
                    placeholder="Nombre"
                    className="input h-9 min-w-0 flex-1 text-xs"
                  />
                )}
              </div>

              {/* Búsqueda */}
              <div className="relative mb-2">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cream-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar platillo…"
                  className="input h-9 pl-8 pr-8 text-xs"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-cream-500 transition hover:text-cream-200"
                    aria-label="Limpiar búsqueda"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Categorías */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {itemsByCategory.map(({ category }) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      document
                        .getElementById(`cat-${category.id}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    className="chip shrink-0 py-1 text-[11px]"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menú */}
            {loading ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            ) : itemsByCategory.length === 0 ? (
              <div className="empty-state">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-cream-500">
                  <SearchIcon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium text-cream-200">
                    {query ? 'Sin resultados' : 'Sin platillos disponibles'}
                  </p>
                  <p className="mt-1 text-sm text-cream-500">
                    {query
                      ? `No encontramos “${query}” en el menú.`
                      : 'Agrega platillos al menú para poder tomarlos.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {itemsByCategory.map(({ category, items: catItems }) => (
                  <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-48">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="h-px w-6 bg-ember-500/60" />
                      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-400">
                        {category.name}
                      </h2>
                      <span className="text-xs tabular-nums text-cream-500">{catItems.length}</span>
                    </div>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2">
                      {catItems.map((item) => {
                        const qty = cart.find((c) => c.item.id === item.id)?.quantity ?? 0
                        if (qty === 0) {
                          return (
                            <li key={item.id} className="min-w-0">
                              <button
                                onClick={() => addToCart(item)}
                                className="group flex w-full items-center justify-between gap-1.5 rounded-lg border border-ink-700 bg-ink-900 p-2 text-left transition hover:border-ember-500/60 hover:bg-ink-800 active:scale-[0.99]"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-[13px] font-medium leading-tight text-cream-100">
                                    {item.name}
                                  </span>
                                  <span className="mt-0.5 block font-mono text-[11px] tabular-nums text-cream-500 transition group-hover:text-ember-400">
                                    {soles(Number(item.price))}
                                  </span>
                                </span>
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-ink-700 bg-ink-800 text-ember-400 transition group-hover:border-ember-500 group-hover:bg-ember-500 group-hover:text-ink-950">
                                  <PlusIcon className="h-3.5 w-3.5" />
                                </span>
                              </button>
                            </li>
                          )
                        }
                        return (
                          <li key={item.id} className="min-w-0">
                            <div className="flex w-full items-center justify-between gap-1.5 rounded-lg border border-ember-500/40 bg-ember-500/[0.07] p-2">
                              <span className="min-w-0">
                                <span className="block truncate text-[13px] font-medium leading-tight text-cream-100">
                                  {item.name}
                                </span>
                                <span className="mt-0.5 block font-mono text-[11px] tabular-nums text-ember-400">
                                  {soles(Number(item.price))}
                                </span>
                              </span>
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="flex h-6 w-6 items-center justify-center rounded-md border border-ink-700 text-cream-300 transition hover:border-ink-600 hover:text-cream-100 active:scale-95"
                                  aria-label={`Quitar ${item.name}`}
                                >
                                  <MinusIcon className="h-3 w-3" />
                                </button>
                                <span className="w-4 text-center font-mono text-xs font-semibold tabular-nums text-cream-100">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="flex h-6 w-6 items-center justify-center rounded-md border border-ember-500/50 bg-ember-500 text-ink-950 transition hover:bg-ember-400 active:scale-95"
                                  aria-label={`Agregar ${item.name}`}
                                >
                                  <PlusIcon className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* Carrito (desktop) */}
          <aside className="hidden lg:block">
            <div className="card sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
                <h2 className="font-display text-lg font-semibold tracking-tight text-cream-50">
                  Pedido
                </h2>
                <span className="badge-amber">{cart.length}</span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <CartItems cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
                <div className="mt-4">
                  <CartFooter
                    subtotal={subtotal}
                    total={total}
                    orderType={orderType}
                    deliveryFee={deliveryFee}
                    note={note}
                    onNoteChange={setNote}
                    error={error}
                    loading={loading}
                    disabled={loading || cart.length === 0}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Barra inferior móvil: ver pedido (encima de la nav) */}
      <div
        className="fixed inset-x-0 z-40 border-t border-ink-700 bg-ink-950/95 px-4 py-3 backdrop-blur-md lg:hidden"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setShowSheet(true)}
          className="btn-primary mx-auto flex w-full max-w-md items-center justify-between px-4 py-3"
        >
          <span className="text-sm font-semibold">
            Ver pedido · {cart.length} {cart.length === 1 ? 'plato' : 'platos'}
          </span>
          <span className="font-display text-lg font-semibold tabular-nums">{soles(total)}</span>
        </button>
      </div>

      {/* Sheet móvil del pedido (pie fijo con total y enviar) */}
      {showSheet && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-ink-800 bg-ink-900">
            <div className="flex items-center justify-between gap-2 border-b border-ink-800 px-4 py-3">
              <h2 className="font-display text-lg font-semibold tracking-tight text-cream-50">
                Pedido
              </h2>
              <span className="badge-amber">{cart.length}</span>
              <button onClick={() => setShowSheet(false)} className="btn-icon" aria-label="Cerrar">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <CartItems cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
            </div>

            <div
              className="border-t border-ink-800 bg-ink-900 p-4"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <CartFooter
                subtotal={subtotal}
                total={total}
                orderType={orderType}
                deliveryFee={deliveryFee}
                note={note}
                onNoteChange={setNote}
                error={error}
                loading={loading}
                disabled={loading || cart.length === 0}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
