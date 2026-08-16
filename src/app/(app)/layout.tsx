import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/app-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNav
        role={profile?.role ?? 'waiter'}
        fullName={profile?.full_name ?? ''}
        email={user.email ?? ''}
      />
      <main className="mx-auto max-w-5xl p-6 pb-16">{children}</main>
    </div>
  )
}