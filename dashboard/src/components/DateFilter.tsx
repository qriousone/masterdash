'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

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
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigate(-1)}
        className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors">
        <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-xs text-zinc-300 font-medium">{label}</span>
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
        className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isToday && (
        <button
          onClick={() => router.push('/')}
          className="ml-1 text-[10px] text-amber-500 hover:text-amber-400 font-medium"
        >
          Back to today
        </button>
      )}
    </div>
  )
}
