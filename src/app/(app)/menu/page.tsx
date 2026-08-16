import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/menu/category-form'
import ItemForm from '@/components/menu/item-form'
import DeleteButton from '@/components/menu/delete-button'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: items }, { data: profile }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('menu_items').select('*').order('name'),
    supabase.from('profiles').select('role').single(),
  ])

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-500">Carta</p>
          <h1 className="page-title mt-1">Menú</h1>
        </div>
        {isAdmin && <CategoryForm />}
      </div>

      {categories?.length === 0 ? (
        <div className="card p-10 text-center text-cream-500">
          Aún no hay categorías.
          {isAdmin ? ' Crea la primera con "Nueva categoría".' : ''}
        </div>
      ) : (
        <div className="space-y-10">
          {categories?.map((category) => {
            const categoryItems = items?.filter((i) => i.category_id === category.id) ?? []

            return (
              <section key={category.id}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-ember-500/60" />
                    <h2 className="font-display text-xl font-semibold tracking-tight text-cream-50">
                      {category.name}
                    </h2>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <ItemForm categoryId={category.id} />
                      <DeleteButton table="categories" id={category.id} label="Eliminar categoría" />
                    </div>
                  )}
                </div>

                {categoryItems.length === 0 ? (
                  <p className="text-sm text-cream-500">Sin platillos.</p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {categoryItems.map((item) => (
                      <li
                        key={item.id}
                        className={`group card flex items-start justify-between gap-3 p-4 transition hover:border-ink-600 ${
                          !item.available ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-cream-100">{item.name}</p>
                            {!item.available && (
                              <span className="badge-neutral shrink-0">agotado</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="mt-0.5 text-sm text-cream-500">{item.description}</p>
                          )}
                          <p className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-ember-400">
                            S/{Number(item.price).toFixed(2)}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex shrink-0 items-center gap-1">
                            <ItemForm categoryId={category.id} item={item} />
                            <DeleteButton table="menu_items" id={item.id} label="Eliminar" />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}

      <Link
        href="/orders/new"
        className="mt-10 inline-flex items-center gap-1 text-sm text-cream-400 underline-offset-4 transition hover:text-ember-400 hover:underline"
      >
        ← Crear un pedido
      </Link>
    </div>
  )
}