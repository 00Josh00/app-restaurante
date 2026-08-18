'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/modal'
import { TrashIcon } from '@/components/ui/icons'
import { ROLE_BADGE, ROLE_LABELS, ROLE_OPTIONS } from '@/lib/roles'

type User = {
  id: string
  email: string
  full_name: string | null
  role: string
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export default function UserRow({
  user,
  isSelf,
}: {
  user: User
  isSelf: boolean
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeRole = async (role: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role }),
    })
    router.refresh()
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Error al eliminar')
      setDeleting(false)
      return
    }
    setConfirmOpen(false)
    router.refresh()
  }

  return (
    <li className="card flex items-center gap-3 p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-sm font-semibold text-ember-400">
        {initials(user.full_name || user.email)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-cream-100">
          {user.full_name || 'Sin nombre'}
          {isSelf && <span className="ml-2 text-xs text-cream-500">(tú)</span>}
        </p>
        <p className="truncate text-xs text-cream-500">{user.email}</p>
      </div>

      <span className={`hidden sm:inline-flex ${ROLE_BADGE[user.role] ?? 'badge-neutral'}`}>
        {ROLE_LABELS[user.role] ?? user.role}
      </span>

      <select
        value={user.role}
        onChange={(e) => changeRole(e.target.value)}
        disabled={isSelf}
        className="rounded-lg border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-sm text-cream-200 outline-none transition focus:border-ember-500 disabled:opacity-50"
        aria-label={`Rol de ${user.email}`}
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => setConfirmOpen(true)}
        disabled={isSelf}
        className="btn-ghost-icon text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-30"
        title="Eliminar"
        aria-label="Eliminar usuario"
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Eliminar usuario">
        <p className="text-sm text-cream-300">
          ¿Eliminar a <span className="font-medium text-cream-100">{user.email}</span>? Perderá el
          acceso a la cuenta.
        </p>
        {error && <p className="alert-error mt-3">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setConfirmOpen(false)} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger px-4 py-2">
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </li>
  )
}