import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  BookIcon,
  ChartIcon,
  ClipboardIcon,
  ListIcon,
  UsersIcon,
  UtensilsIcon,
} from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  waiter: 'Mesero',
  cook: 'Cocinero',
}

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

  const role = profile?.role ?? 'waiter'

  const links: Record<string, { href: string; label: string; desc: string; Icon: typeof ListIcon }[]> = {
    waiter: [
      { href: '/orders/new', label: 'Nuevo pedido', desc: 'Tomar un pedido de mesa o delivery', Icon: ClipboardIcon },
      { href: '/orders', label: 'Órdenes', desc: 'Ver órdenes y cobrar', Icon: ListIcon },
      { href: '/menu', label: 'Menú', desc: 'Consultar los platillos', Icon: BookIcon },
    ],
    cook: [
      { href: '/kitchen', label: 'Cocina', desc: 'Recibir y preparar pedidos en tiempo real', Icon: UtensilsIcon },
      { href: '/orders', label: 'Órdenes', desc: 'Historial de órdenes', Icon: ListIcon },
      { href: '/menu', label: 'Menú', desc: 'Consultar los platillos', Icon: BookIcon },
    ],
    admin: [
      { href: '/orders/new', label: 'Nuevo pedido', desc: 'Tomar un pedido de mesa o delivery', Icon: ClipboardIcon },
      { href: '/kitchen', label: 'Cocina', desc: 'Recibir y preparar pedidos', Icon: UtensilsIcon },
      { href: '/orders', label: 'Órdenes', desc: 'Ver órdenes y cobrar', Icon: ListIcon },
      { href: '/menu', label: 'Menú', desc: 'Administrar categorías y platillos', Icon: BookIcon },
      { href: '/reports', label: 'Reportes', desc: 'Métricas y ventas del día', Icon: ChartIcon },
      { href: '/users', label: 'Usuarios', desc: 'Crear meseros, cocineros y admins', Icon: UsersIcon },
    ],
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-500">
        {ROLE_LABELS[role]}
      </p>
      <h1 className="page-title mt-1">
        {profile?.full_name ? `Hola, ${profile.full_name}` : 'Bienvenido'}
      </h1>
      <p className="mt-1 text-cream-500">¿Qué haremos hoy?</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(links[role] ?? []).map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group card flex items-start gap-4 p-5 transition hover:border-ember-500/60 hover:bg-ink-800"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-700 bg-ink-800 text-ember-400 transition group-hover:border-ember-500/50 group-hover:bg-ember-500/10">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-lg font-semibold text-cream-50">
                {label}
              </span>
              <span className="mt-0.5 block text-sm text-cream-500">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}