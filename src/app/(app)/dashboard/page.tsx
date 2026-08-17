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
      { href: '/reports', label: 'Reportes', desc: 'Ventas del mes y métricas', Icon: ChartIcon },
      { href: '/users', label: 'Usuarios', desc: 'Crear meseros, cocineros y admins', Icon: UsersIcon },
    ],
  }

  const today = new Date().toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-ink-800 bg-ink-900 p-6 sm:p-8">
        <div className="relative">
          <p className="eyebrow">{ROLE_LABELS[role]}</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-cream-50 sm:text-4xl">
            {profile?.full_name ? `Hola, ${profile.full_name}` : 'Bienvenido'}
          </h1>
          <p className="mt-2 text-sm capitalize text-cream-400 sm:text-base">
            {todayLabel} · ¿Qué haremos hoy?
          </p>
        </div>
      </section>

      {/* Accesos rápidos */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(links[role] ?? []).map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="card-interactive group flex items-center gap-4 p-4"
          >
            <Icon className="h-5 w-5 shrink-0 text-ember-400" />
            <span className="min-w-0 flex-1">
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