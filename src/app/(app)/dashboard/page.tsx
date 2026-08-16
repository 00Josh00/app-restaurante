import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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

  const links: Record<string, { href: string; label: string; desc: string }[]> = {
    waiter: [
      { href: '/orders/new', label: 'Nuevo pedido', desc: 'Tomar un pedido de mesa o delivery' },
      { href: '/orders', label: 'Órdenes', desc: 'Ver órdenes y cobrar' },
      { href: '/menu', label: 'Menú', desc: 'Consultar los platillos' },
    ],
    cook: [
      { href: '/kitchen', label: 'Cocina', desc: 'Recibir y preparar pedidos en tiempo real' },
      { href: '/orders', label: 'Órdenes', desc: 'Historial de órdenes' },
      { href: '/menu', label: 'Menú', desc: 'Consultar los platillos' },
    ],
    admin: [
      { href: '/orders/new', label: 'Nuevo pedido', desc: 'Tomar un pedido de mesa o delivery' },
      { href: '/kitchen', label: 'Cocina', desc: 'Recibir y preparar pedidos' },
      { href: '/orders', label: 'Órdenes', desc: 'Ver órdenes y cobrar' },
      { href: '/menu', label: 'Menú', desc: 'Administrar categorías y platillos' },
    ],
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">
        {profile?.full_name ? `Hola, ${profile.full_name}` : 'Dashboard'}
      </h1>
      <p className="mt-1 text-zinc-500">
        Rol: <span className="font-medium text-zinc-700">{ROLE_LABELS[role]}</span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(links[role] ?? []).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-900"
          >
            <p className="font-semibold text-zinc-900">{link.label}</p>
            <p className="mt-1 text-sm text-zinc-500">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}