'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function MonthPicker({ value }: { value: string }) {
  const router = useRouter()

  const months = useMemo(() => {
    const list: { ym: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d
        .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
        .replace(' de ', ' ')
      list.push({ ym, label: label.charAt(0).toUpperCase() + label.slice(1) })
    }
    return list
  }, [])

  const onChange = (ym: string) => {
    router.push(`/reports?month=${ym}`)
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input w-auto"
      aria-label="Mes de reporte"
    >
      {months.map((m) => (
        <option key={m.ym} value={m.ym}>
          {m.label}
        </option>
      ))}
    </select>
  )
}