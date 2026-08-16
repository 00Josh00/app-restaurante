'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BookIcon,
  ChartIcon,
  ClipboardIcon,
  ListIcon,
  LogoMark,
  LogoutIcon,
  UsersIcon,
  UtensilsIcon,
} from '@/components/ui/icons'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  waiter: 'Mesero',
  cook: 'Cocinero',
}

const LINKS = [
  { href: '/orders/new', label: 'Nuevo pedido', roles: ['waiter', 'admin'], Icon: ClipboardIcon },
  { href: '/kitchen', label: 'Cocina', roles: ['cook', 'admin'], Icon: UtensilsIcon },
  { href: '/orders', label: 'Órdenes', roles: ['waiter', 'cook', 'admin'], Icon: ListIcon },
  { href: '/menu', label: 'Menú', roles: ['waiter', 'cook', 'admin'], Icon: BookIcon },
  { href: '/reports', label: 'Reportes', roles: ['admin'], Icon: ChartIcon },
  { href: '/users', label: 'Usuarios', roles: ['admin'], Icon: UsersIcon },
]

export default function AppNav({
  role,
  fullName,
}: {
  role: string
  fullName: string
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
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LogoMark className="h-7 w-7 text-ember-500" />
          <span className="font-display text-lg font-semibold tracking-tight text-cream-50">
            Kleta
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {visibleLinks.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                  active
                    ? 'bg-ember-500/15 font-medium text-ember-400'
                    : 'text-cream-300 hover:bg-ink-800 hover:text-cream-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-cream-100">{fullName}</p>
            <p className="text-xs text-cream-500">
              {ROLE_LABELS[role] ?? role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Salir"
            className="flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-1.5 text-sm text-cream-300 transition hover:border-rose-500/50 hover:text-rose-400"
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}