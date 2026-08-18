import { describe, expect, it } from 'vitest'
import { STATUS_ACCENT, STATUS_BADGE, STATUS_LABELS, type OrderStatus } from './order-status'

const ALL: OrderStatus[] = ['pendiente', 'en_cocina', 'listo', 'entregado', 'cobrado']

describe('order-status', () => {
  it('cubre todos los estados con label', () => {
    for (const status of ALL) {
      expect(STATUS_LABELS[status]).toBeTruthy()
    }
  })

  it('cubre todos los estados con badge', () => {
    for (const status of ALL) {
      expect(STATUS_BADGE[status]).toMatch(/^badge-/)
    }
  })

  it('cubre todos los estados con color de acento', () => {
    for (const status of ALL) {
      expect(STATUS_ACCENT[status]).toMatch(/^bg-/)
    }
  })

  it('no tiene estados huérfanos ni labels duplicados', () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(ALL.length)
    expect(Object.keys(STATUS_BADGE)).toHaveLength(ALL.length)
    expect(Object.keys(STATUS_ACCENT)).toHaveLength(ALL.length)
    expect(new Set(Object.values(STATUS_LABELS)).size).toBe(ALL.length)
  })
})
