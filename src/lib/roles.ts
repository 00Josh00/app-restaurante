export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  waiter: 'Mesero',
  cook: 'Cocinero',
}

export const ROLE_OPTIONS = [
  { value: 'waiter', label: 'Mesero' },
  { value: 'cook', label: 'Cocinero' },
  { value: 'admin', label: 'Admin' },
] as const

export const ROLE_BADGE: Record<string, string> = {
  waiter: 'badge-neutral',
  cook: 'badge-amber',
  admin: 'badge-emerald',
}
