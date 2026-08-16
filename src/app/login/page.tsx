'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoMark } from '@/components/ui/icons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_-10%,rgba(245,158,11,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_35%_at_80%_110%,rgba(245,158,11,0.06),transparent)]" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-3xl border border-ink-700 bg-ink-900/90 p-8 shadow-2xl shadow-black/50 backdrop-blur"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-12 w-12 text-ember-500" />
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-cream-50">
            Kleta
          </h1>
          <p className="mt-1 text-sm text-cream-500">Inicia sesión para operar</p>
        </div>

        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mb-4"
          placeholder="correo@kleta.com"
          autoComplete="email"
        />

        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mb-4"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && (
          <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 text-base"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}