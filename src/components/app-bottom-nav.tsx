'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BOTTOM_NAV_LINKS } from '@/components/app-nav'

export default function AppBottomNav({ role }: { role: string }) {
  const pathname = usePathname()

  const links = BOTTOM_NAV_LINKS.filter((l) => l.roles.includes(role))

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {links.map(({ href, label, Icon }) => {
          // Comparación exacta: en /orders/new no debe marcarse /orders
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-1 text-center transition active:scale-95 ${
                active ? 'text-ember-400' : 'text-cream-500'
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-ember-500" />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}