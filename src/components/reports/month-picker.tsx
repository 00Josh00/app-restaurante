'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarIcon } from '@/components/ui/icons'

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
    <div className="relative">
      <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-auto cursor-pointer appearance-none pl-10 pr-9"
        aria-label="Mes de reporte"
      >
        {months.map((m) => (
          <option key={m.ym} value={m.ym}>
            {m.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-500"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}