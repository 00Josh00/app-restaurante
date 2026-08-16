import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UserForm from '@/components/users/user-form'
import UserRow from '@/components/users/user-row'
import { UsersIcon } from '@/components/ui/icons'

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
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ember-500">
            <UsersIcon className="h-4 w-4" /> Equipo
          </p>
          <h1 className="page-title mt-1">Usuarios</h1>
        </div>
        <UserForm />
      </div>

      {!users || users.length === 0 ? (
        <div className="card p-10 text-center text-cream-500">Aún no hay usuarios.</div>
      ) : (
        <ul className="space-y-2.5">
          {users.map((u) => (
            <UserRow key={u.id} user={u} isSelf={u.id === user?.id} />
          ))}
        </ul>
      )}
    </div>
  )
}