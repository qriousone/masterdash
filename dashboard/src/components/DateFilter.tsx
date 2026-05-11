'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const today = new Date().toISOString().split('T')[0]
  const selected = searchParams.get('date') ?? today

  function navigate(offset: number) {
    const d = new Date(selected + 'T00:00:00')
    d.setDate(d.getDate() + offset)
    const next = d.toISOString().split('T')[0]
    router.push(next === today ? '/' : `/?date=${next}`)
  }

  function onDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    router.push(val === today ? '/' : `/?date=${val}`)
  }

  const isToday = selected === today

  const label = isToday
    ? 'Today'
    : new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => navigate(-1)} className="text-zinc-700 hover:text-zinc-400 transition-colors">
        <ChevronLeft className="w-3 h-3" />
      </button>

      <label className="cursor-pointer relative">
        <span className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors tracking-wide">
          {label}
        </span>
        <input
          type="date"
          value={selected}
          max={today}
          onChange={onDateChange}
          className="absolute opacity-0 w-0 h-0"
        />
      </label>

      <button
        onClick={() => navigate(1)}
        disabled={isToday}
        className="text-zinc-700 hover:text-zinc-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-3 h-3" />
      </button>

      {!isToday && (
        <button
          onClick={() => router.push('/')}
          className="text-[9px] text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          Today
        </button>
      )}
    </div>
  )
}
