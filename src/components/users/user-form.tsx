'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/modal'
import { PlusIcon } from '@/components/ui/icons'

const ROLES = [
  { value: 'waiter', label: 'Mesero' },
  { value: 'cook', label: 'Cocinero' },
  { value: 'admin', label: 'Admin' },
]

export default function UserForm() {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('waiter')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password, role }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al crear el usuario')
      setLoading(false)
      return
    }

    setOpen(false)
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('waiter')
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <PlusIcon className="h-4 w-4" />
        Nuevo usuario
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo usuario">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="user-name">
              Nombre
            </label>
            <input
              id="user-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <label className="label" htmlFor="user-email">
              Email
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="correo@kleta.com"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="user-password">
              Contraseña
            </label>
            <input
              id="user-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="label" htmlFor="user-role">
              Rol
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando…' : 'Crear usuario'}
          </button>
        </form>
      </Modal>
    </>
  )
}