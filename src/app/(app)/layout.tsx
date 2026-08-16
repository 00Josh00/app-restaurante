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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(70%_45%_at_50%_-10%,rgba(245,158,11,0.07),transparent)]" />
      <div className="relative">
        <AppNav
          role={profile?.role ?? 'waiter'}
          fullName={profile?.full_name ?? ''}
        />
        <main className="mx-auto max-w-6xl p-4 pb-24 sm:p-6 sm:pb-6">{children}</main>
        <AppBottomNav
          role={profile?.role ?? 'waiter'}
        />
      </div>
    </div>
  )
}