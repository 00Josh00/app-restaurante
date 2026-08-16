'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  waiter: 'Mesero',
  cook: 'Cocinero',
}

export default function AppNav({
  role,
  fullName,
  email,
}: {
  role: string
  fullName: string
  email: string
}) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <div>
          <p className="font-semibold text-zinc-900">{fullName || 'Restaurante'}</p>
          <p className="text-xs text-zinc-500">
            {email} · {ROLE_LABELS[role] ?? role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}