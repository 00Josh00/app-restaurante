import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/app-nav'
import AppBottomNav from '@/components/app-bottom-nav'

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
    <div className="relative min-h-screen bg-ink-950">
      <div className="relative flex min-h-screen flex-col">
        <AppNav role={profile?.role ?? 'waiter'} fullName={profile?.full_name ?? ''} />
        <main className="mx-auto w-full max-w-6xl flex-1 p-3 pb-32 sm:p-6 sm:pb-10">
          {children}
        </main>
        <AppBottomNav role={profile?.role ?? 'waiter'} />
      </div>
    </div>
  )
}