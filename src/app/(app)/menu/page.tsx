import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/menu/category-form'
import ItemForm from '@/components/menu/item-form'
import DeleteButton from '@/components/menu/delete-button'
import AvailableToggle from '@/components/menu/available-toggle'
import { BookIcon } from '@/components/ui/icons'

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
    <div className="mx-auto max-w-3xl overflow-x-hidden">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 eyebrow">
            <BookIcon className="h-4 w-4" /> Carta
          </p>
          <h1 className="page-title mt-1">Menú</h1>
          <p className="mt-1 text-sm text-cream-500">Platillos y categorías del restaurante.</p>
        </div>
        {isAdmin && <CategoryForm />}
      </div>

      {!categories || categories.length === 0 ? (
        <div className="empty-state">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-cream-500">
            <BookIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-medium text-cream-200">Aún no hay categorías</p>
            <p className="mt-1 text-sm text-cream-500">
              {isAdmin
                ? 'Crea la primera con "Nueva categoría".'
                : 'El administrador aún no agrega contenido.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-7">
          {categories?.map((category) => {
            const categoryItems = items?.filter((i) => i.category_id === category.id) ?? []

            return (
              <section key={category.id}>
                {/* Cabecera de categoría */}
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-px w-6 shrink-0 bg-ember-500/60" />
                    <h2 className="font-display truncate text-lg font-semibold tracking-tight text-cream-50">
                      {category.name}
                    </h2>
                    <span className="badge-neutral shrink-0">{categoryItems.length}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex shrink-0 items-center gap-1">
                      <ItemForm categoryId={category.id} />
                      <CategoryForm existing={{ id: category.id, name: category.name }} />
                      <DeleteButton table="categories" id={category.id} label="Eliminar categoría" />
                    </div>
                  )}
                </div>

                {categoryItems.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-ink-700 px-4 py-4 text-sm text-cream-500">
                    {isAdmin
                      ? 'Sin platillos. Agrega el primero con "Agregar platillo".'
                      : 'Sin platillos en esta categoría.'}
                  </p>
                ) : (
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2">
                    {categoryItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex min-w-0 flex-col rounded-lg border border-ink-700 bg-ink-900 p-2.5 transition hover:border-ink-600"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className={`truncate text-[13px] font-medium leading-tight ${
                                item.available ? 'text-cream-100' : 'text-cream-400'
                              }`}
                            >
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-cream-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex shrink-0 items-center gap-0.5">
                              <ItemForm categoryId={category.id} item={item} />
                              <DeleteButton table="menu_items" id={item.id} label="Eliminar" />
                            </div>
                          )}
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                          <span
                            className={`font-mono text-sm font-semibold tabular-nums ${
                              item.available ? 'text-ember-400' : 'text-cream-500'
                            }`}
                          >
                            S/{Number(item.price).toFixed(2)}
                          </span>
                          {isAdmin ? (
                            <AvailableToggle item={item} />
                          ) : item.available ? (
                            <span className="badge-emerald">Disponible</span>
                          ) : (
                            <span className="badge-rose">Agotado</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
