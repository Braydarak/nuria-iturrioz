import { useState, useMemo } from 'react'
import { useLetStatistics, type StatEntry } from '../../data/useLetStatistics'

export default function StatsComponent() {
  const { data, entries, loading, error, hasData } = useLetStatistics()
  const [showAll, setShowAll] = useState(false)

  const featured = [
    { label: 'Tournament Wins', value: data?.tournamentWins ?? null },
    { label: 'Tournament Top Ten Finishes', value: data?.tournamentTopTenFinishes ?? null },
    { label: 'Driving Distance', value: data?.drivingDistance ?? null },
  ]

  const filteredEntries = useMemo(() => {
    const featuredLabels = new Set(['Tournament Wins', 'Tournament Top Ten Finishes', 'Driving Distance'].map((l) => l.toLowerCase()))
    const featuredCodes = new Set<string>()
    for (const e of entries) {
      const desc = e.description?.toLowerCase?.() ?? ''
      if (featuredLabels.has(desc) && e.code) featuredCodes.add(e.code)
    }
    featuredCodes.add('S155')

    return entries.filter((e: StatEntry) => {
      const desc = e.description.toLowerCase()
      const code = e.code
      if (desc.includes('overall money')) return false
      if (featuredLabels.has(desc)) return false
      if (code && featuredCodes.has(code)) return false
      return true
    })
  }, [entries])

  if (loading) {
    return (
      <section className="p-6 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-5 animate-pulse">
              <div className="h-4 w-24 bg-white/60 rounded mb-3" />
              <div className="h-6 w-16 bg-white/60 rounded" />
            </div>
          ))}
        </div>
      </section>
    )
  }
  if (error) {
    return (
      <section className="p-6 text-white">
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">Error: {error}</div>
      </section>
    )
  }
  if (!hasData) {
    return (
      <section className="p-6 text-white">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 p-4">No hay estadísticas disponibles por ahora.</div>
      </section>
    )
  }

  return (
    <section className="p-6 text-white">
      <div className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-5">
              <div className="text-sm text-white/90">{item.label}</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {item.value ?? '—'}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Otras estadísticas</h3>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-sm font-medium text-white hover:text-white/80"
            >
              {showAll ? 'ocultar estadísticas completas' : 'ver estadísticas completas'}
            </button>
          </div>

          {showAll && (
            filteredEntries.length === 0 ? (
              <div className="text-sm text-white/90">No hay más estadísticas disponibles.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEntries.map((e: StatEntry) => (
                  <div key={`${e.code ?? e.description}`} className="rounded-xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-4">
                    <div className="text-xs text-white/90">{e.description}</div>
                    <div className="mt-1 text-xl font-semibold text-white">
                      {e.value ?? e.played ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}