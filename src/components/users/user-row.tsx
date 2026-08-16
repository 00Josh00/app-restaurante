'use client'

import { useRouter } from 'next/navigation'
import { TrashIcon, UserRoundIcon } from '@/components/ui/icons'

const ROLES = [
  { value: 'waiter', label: 'Mesero' },
  { value: 'cook', label: 'Cocinero' },
  { value: 'admin', label: 'Admin' },
]

type User = {
  id: string
  email: string
  full_name: string | null
  role: string
}

export default function UserRow({
  user,
  isSelf,
}: {
  user: User
  isSelf: boolean
}) {
  const router = useRouter()

  const changeRole = async (role: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role }),
    })
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${user.email}?`)) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id }),
    })
    const data = await res.json()
    if (!res.ok) alert(data.error ?? 'Error al eliminar')
    router.refresh()
  }

  return (
    <li className="card flex flex-wrap items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-800 text-ember-400">
        <UserRoundIcon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-cream-100">
          {user.full_name || user.email}
          {isSelf && <span className="ml-2 text-xs text-cream-500">(tú)</span>}
        </p>
        <p className="truncate text-xs text-cream-500">{user.email}</p>
      </div>

      <select
        value={user.role}
        onChange={(e) => changeRole(e.target.value)}
        disabled={isSelf}
        className="rounded-lg border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-sm text-cream-200 outline-none transition focus:border-ember-500 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleDelete}
        disabled={isSelf}
        className="btn-danger px-2.5 py-1.5 disabled:opacity-30"
        title="Eliminar"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </li>
  )
}