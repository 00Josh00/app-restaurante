'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarIcon } from '@/components/ui/icons'

export default function MonthPicker({ value }: { value: string }) {
  const router = useRouter()

  const months = useMemo(() => {
    // Mes base en horario de Lima (consistente con el resto de la app)
    const [year, month] = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
    })
      .format(new Date())
      .split('-')
      .map(Number)

    const list: { ym: string; label: string }[] = []
    for (let i = 0; i < 24; i++) {
      const total = year * 12 + (month - 1) - i
      const y = Math.floor(total / 12)
      const m = (total % 12) + 1
      const ym = `${y}-${String(m).padStart(2, '0')}`
      const label = new Date(y, m - 1, 1)
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