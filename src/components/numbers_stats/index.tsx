import { useEffect, useMemo, useState } from 'react'
import { useLetStatistics } from '../statsComponent/useLetStatistics'

function useCountUp(target: number | null, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === null || typeof target !== 'number' || !Number.isFinite(target)) return
    let raf = 0
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function toNumberSafe(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v)
  if (typeof v === 'string') {
    const n = Number(String(v).replace(/[^0-9.-]/g, ''))
    return Number.isFinite(n) ? Math.round(n) : null
  }
  return null
}

export default function NumbersStats() {
  const { data, entries, loading, error, memberAge } = useLetStatistics()

  const tournaments = useMemo(() => {
    const byCode = entries.find((e) => e.code === 'B010')
    const candidate = byCode ?? entries.find((e) => e.description.toLowerCase().includes('tournament') && e.description.toLowerCase().includes('tournaments'))
    return toNumberSafe(candidate?.tournaments) ?? toNumberSafe(candidate?.played) ?? toNumberSafe(candidate?.value) ?? null
  }, [entries])

  const wins = useMemo(() => {
    if (typeof data?.tournamentWins === 'number') return data.tournamentWins
    const fromEntries = entries.find((e) => e.description.toLowerCase() === 'tournament wins')
    return toNumberSafe(fromEntries?.value)
  }, [data, entries])

  const VISITED_COUNRTIES = 50

  const ageCount = useCountUp(memberAge ?? null)
  const winsCount = useCountUp(wins ?? null)
  const tournamentsCount = useCountUp(tournaments ?? null)
  const visitedCount = useCountUp(VISITED_COUNRTIES)

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-6 animate-pulse">
              <div className="h-7 w-20 bg-neutral-200 rounded mx-auto mb-3" />
              <div className="h-4 w-24 bg-neutral-200 rounded mx-auto" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">Error: {error}</div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard value={ageCount} label="Edad" />
        <StatCard value={winsCount ?? 0} label="Victorias" />
        <StatCard value={tournamentsCount ?? 0} label="Torneos jugados" />
        <StatCard value={visitedCount} label="Países visitados" />
      </div>
    </section>
  )
}

function StatCard({ value, label }: { value: number, label: string }) {
  return (
    <div className="text-center rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 px-6 py-8">
      <div className="text-4xl sm:text-5xl font-extrabold text-neutral-900">{value}</div>
      <div className="mt-2 text-sm sm:text-base text-neutral-600">{label}</div>
    </div>
  )
}