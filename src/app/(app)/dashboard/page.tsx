import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user?.id ?? '')
    .single()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">
        {profile?.full_name ? `Hola, ${profile.full_name}` : 'Dashboard'}
      </h1>
      <p className="mt-1 text-zinc-500">Bienvenido al panel del restaurante.</p>
    </div>
  )
}