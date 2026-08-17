export type OrderStatus = 'pendiente' | 'en_cocina' | 'listo' | 'entregado' | 'cobrado'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_cocina: 'En cocina',
  listo: 'Listo',
  entregado: 'Entregado',
  cobrado: 'Cobrado',
}

export const STATUS_BADGE: Record<OrderStatus, string> = {
  pendiente: 'badge-rose',
  en_cocina: 'badge-amber',
  listo: 'badge-emerald',
  entregado: 'badge-neutral',
  cobrado: 'badge-neutral',
}

export const STATUS_ACCENT: Record<OrderStatus, string> = {
  pendiente: 'bg-rose-500',
  en_cocina: 'bg-ember-500',
  listo: 'bg-emerald-500',
  entregado: 'bg-ink-600',
  cobrado: 'bg-ink-600',
}