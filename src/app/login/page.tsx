'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BikeIcon,
  ChartIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  LogoMark,
  MailIcon,
  UtensilsIcon,
} from '@/components/ui/icons'

const HIGHLIGHTS = [
  {
    Icon: UtensilsIcon,
    title: 'Cocina en tiempo real',
    desc: 'Los pedidos llegan al instante y avisan con sonido.',
  },
  {
    Icon: BikeIcon,
    title: 'Mesa y delivery',
    desc: 'Toma pedidos en sala o a domicilio sin complicaciones.',
  },
  {
    Icon: ChartIcon,
    title: 'Reportes por mes',
    desc: 'Ventas, platillos más vendidos y desempeño por semana.',
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_-10%,rgba(245,158,11,0.12),transparent)]" />

      {/* Panel de marca (desktop) */}
      <aside className="relative hidden w-1/2 flex-col justify-between border-r border-ink-800 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-ember-500/30 bg-ember-500/10 text-ember-400">
            <LogoMark className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-2xl font-semibold tracking-tight text-cream-50">
              Kleta
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cream-500">
              Restaurante
            </p>
          </div>
        </div>

        <div className="max-w-sm">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-cream-50">
            Tu servicio, en orden desde la primera comanda.
          </h1>
          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map(({ Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-700 bg-ink-900 text-ember-400">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-cream-100">{title}</p>
                  <p className="mt-0.5 text-sm text-cream-500">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-cream-500">
          © {new Date().getFullYear()} Kleta · Restaurante
        </p>
      </aside>

      {/* Formulario */}
      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ember-500/30 bg-ember-500/10 text-ember-400">
              <LogoMark className="h-7 w-7" />
            </span>
            <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-cream-50">
              Kleta
            </h1>
            <p className="mt-1 text-sm text-cream-500">Inicia sesión para operar</p>
          </div>

          <div className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-500">
              Bienvenido
            </p>
            <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-cream-50">
              Inicia sesión
            </h1>
            <p className="mt-1 text-sm text-cream-500">Accede con tu cuenta del equipo.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="correo@kleta.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input px-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-cream-500 transition hover:text-cream-200"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="alert-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}