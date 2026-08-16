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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Menú</h1>
        {isAdmin && <CategoryForm />}
      </div>

      {categories?.length === 0 ? (
        <p className="text-zinc-500">
          Aún no hay categorías. Crea la primera{isAdmin ? ' con el botón "Nueva categoría"' : ''}.
        </p>
      ) : (
        <div className="space-y-8">
          {categories?.map((category) => {
            const categoryItems = items?.filter((i) => i.category_id === category.id) ?? []

            return (
              <section key={category.id}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-800">{category.name}</h2>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <ItemForm categoryId={category.id} />
                      <DeleteButton table="categories" id={category.id} label="Eliminar categoría" />
                    </div>
                  )}
                </div>

                {categoryItems.length === 0 ? (
                  <p className="text-sm text-zinc-400">Sin platillos.</p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {categoryItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-zinc-900">{item.name}</p>
                            {!item.available && (
                              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
                                agotado
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="mt-0.5 text-sm text-zinc-500">{item.description}</p>
                          )}
                          <p className="mt-1 text-sm font-semibold text-zinc-900">
                            ${Number(item.price).toFixed(2)}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
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

      <Link href="/orders/new" className="mt-8 inline-block text-sm text-zinc-600 underline">
        ← Crear un pedido
      </Link>
    </div>
  )
}