import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UserForm from '@/components/users/user-form'
import UserRow from '@/components/users/user-row'
import { ShieldIcon, UsersIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 eyebrow">
            <UsersIcon className="h-4 w-4" /> Equipo
          </p>
          <h1 className="page-title mt-1">Usuarios</h1>
          <p className="mt-1 text-sm text-cream-500">
            Crea cuentas y asigna roles a tu equipo.
          </p>
        </div>
        <UserForm />
      </div>

      {!users || users.length === 0 ? (
        <div className="empty-state">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-cream-500">
            <ShieldIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="font-medium text-cream-200">Aún no hay usuarios</p>
            <p className="mt-1 text-sm text-cream-500">
              Crea el primero con &ldquo;Nuevo usuario&rdquo;.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-cream-500">
            {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
          </p>
          <ul className="space-y-2.5">
            {users.map((u) => (
              <UserRow key={u.id} user={u} isSelf={u.id === user?.id} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}