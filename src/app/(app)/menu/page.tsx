import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/menu/category-form'
import ItemForm from '@/components/menu/item-form'
import DeleteButton from '@/components/menu/delete-button'
import { ArrowLeftIcon, BookIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: categories }, { data: items }, { data: profile }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('menu_items').select('*').order('name'),
    supabase.from('profiles').select('role').eq('id', user?.id ?? '').single(),
  ])

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 eyebrow">
            <BookIcon className="h-4 w-4" /> Carta
          </p>
          <h1 className="page-title mt-1">Menú</h1>
          <p className="mt-1 text-sm text-cream-500">Platillos y categorías del restaurante.</p>
        </div>
        {isAdmin && <CategoryForm />}
      </div>

      {categories?.length === 0 ? (
        <div className="empty-state">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-cream-500">
            <BookIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-medium text-cream-200">Aún no hay categorías</p>
            <p className="mt-1 text-sm text-cream-500">
              {isAdmin ? 'Crea la primera con "Nueva categoría".' : 'El administrador aún no agrega contenido.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {categories?.map((category) => {
            const categoryItems = items?.filter((i) => i.category_id === category.id) ?? []

            return (
              <section key={category.id}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-ember-500/60" />
                    <h2 className="font-display text-xl font-semibold tracking-tight text-cream-50">
                      {category.name}
                    </h2>
                    <span className="badge-neutral">{categoryItems.length}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <ItemForm categoryId={category.id} />
                      <CategoryForm existing={{ id: category.id, name: category.name }} />
                      <DeleteButton table="categories" id={category.id} label="Eliminar categoría" />
                    </div>
                  )}
                </div>

                {categoryItems.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-ink-700 px-4 py-4 text-sm text-cream-500">
                    Sin platillos en esta categoría.
                  </p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryItems.map((item) => (
                      <li
                        key={item.id}
                        className={`card-interactive group flex items-start justify-between gap-3 p-4 ${
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
                          <div className="flex shrink-0 flex-col items-center gap-1.5">
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
        className="mt-10 inline-flex items-center gap-1.5 text-sm text-cream-400 underline-offset-4 transition hover:text-ember-400 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Crear un pedido
      </Link>
    </div>
  )
}