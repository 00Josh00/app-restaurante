import { describe, expect, it } from 'vitest'
import { ROLE_BADGE, ROLE_LABELS, ROLE_OPTIONS } from './roles'

describe('roles', () => {
  it('cada opción de rol tiene label y badge consistentes', () => {
    for (const role of ROLE_OPTIONS) {
      expect(ROLE_LABELS[role.value]).toBe(role.label)
      expect(ROLE_BADGE[role.value]).toMatch(/^badge-/)
    }
  })

  it('los mapas no tienen entradas fuera de las opciones', () => {
    const values = ROLE_OPTIONS.map((r) => r.value)
    expect(Object.keys(ROLE_LABELS).sort()).toEqual([...values].sort())
    expect(Object.keys(ROLE_BADGE).sort()).toEqual([...values].sort())
  })
})
