'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  waiter: 'Mesero',
  cook: 'Cocinero',
}

const LINKS = [
  { href: '/orders/new', label: 'Nuevo pedido', roles: ['waiter', 'admin'] },
  { href: '/kitchen', label: 'Cocina', roles: ['cook', 'admin'] },
  { href: '/orders', label: 'Órdenes', roles: ['waiter', 'cook', 'admin'] },
  { href: '/menu', label: 'Menú', roles: ['waiter', 'cook', 'admin'] },
  { href: '/reports', label: 'Reportes', roles: ['admin'] },
]

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
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const visibleLinks = LINKS.filter((l) => l.roles.includes(role))

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold text-zinc-900">{fullName || 'Restaurante'}</p>
          <p className="text-xs text-zinc-500">
            {email} · {ROLE_LABELS[role] ?? role}
          </p>
        </div>

        <nav className="flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                pathname.startsWith(link.href)
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  )
}