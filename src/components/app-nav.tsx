'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BookIcon,
  ChartIcon,
  ClipboardIcon,
  HomeIcon,
  ListIcon,
  LogoMark,
  LogoutIcon,
  UtensilsIcon,
} from '@/components/ui/icons'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  waiter: 'Mesero',
  cook: 'Cocinero',
}

const NAV_LINKS = [
  { href: '/orders/new', label: 'Nuevo pedido', roles: ['waiter', 'admin'], Icon: ClipboardIcon },
  { href: '/kitchen', label: 'Cocina', roles: ['cook', 'admin'], Icon: UtensilsIcon },
  { href: '/orders', label: 'Órdenes', roles: ['waiter', 'cook', 'admin'], Icon: ListIcon },
  { href: '/menu', label: 'Menú', roles: ['waiter', 'cook', 'admin'], Icon: BookIcon },
  { href: '/reports', label: 'Reportes', roles: ['admin'], Icon: ChartIcon },
]

export const BOTTOM_NAV_LINKS = [
  { href: '/dashboard', label: 'Inicio', roles: ['waiter', 'cook', 'admin'], Icon: HomeIcon },
  ...NAV_LINKS,
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? 'K'
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

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

  const visibleLinks = NAV_LINKS.filter((l) => l.roles.includes(role))
  const displayName = fullName || 'Staff'

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/dashboard" className="group flex items-center gap-2.5">
          <LogoMark className="h-6 w-6 text-ember-400 transition group-hover:text-ember-300" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-cream-50">
              Kleta
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-cream-500">
              Restaurante
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-ember-500/10 font-medium text-ember-400'
                    : 'text-cream-300 hover:bg-ink-800 hover:text-cream-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{label}</span>
                {active && (
                  <span className="absolute inset-x-3 -bottom-[11px] h-0.5 rounded-full bg-ember-500" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2.5 md:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-sm font-semibold text-ember-400">
              {initials(displayName)}
            </span>
            <div className="leading-tight">
              <p className="max-w-[10rem] truncate text-sm font-medium text-cream-100">
                {displayName}
              </p>
              <p className="text-xs text-cream-500">{ROLE_LABELS[role] ?? role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Salir"
            className="btn-icon"
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}