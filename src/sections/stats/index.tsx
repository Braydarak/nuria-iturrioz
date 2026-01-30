import { useState, useMemo } from 'react'
import { useLetStatistics, type StatEntry } from '../../data/useLetStatistics'

export default function StatsSection() {
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
    // Mapear codes de las métricas destacadas por descripción
    for (const e of entries) {
      const desc = e.description?.toLowerCase?.() ?? ''
      if (featuredLabels.has(desc) && e.code) featuredCodes.add(e.code)
    }
    // Asegurar code S155 (Driving Distance)
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

  return (
    <section id="stats" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow">Mis Números en el LET</h2>
        <p className="mt-2 text-sm text-white/80">Pueden presionar abajo para ver mas datos</p>
      </header>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-5 animate-pulse">
              <div className="h-4 w-24 bg-white/60 rounded mb-3" />
              <div className="h-6 w-16 bg-white/60 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>
      )}

      {!loading && !error && hasData && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-5">
                <div className="text-sm text-neutral-500">{item.label}</div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">
                  {item.value ?? '—'}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-neutral-900">Otras estadísticas</h3>
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-sm font-medium text-[#2A579E] hover:text-[#1f4a8f]"
              >
                {showAll ? 'ocultar estadísticas completas' : 'ver estadísticas completas'}
              </button>
            </div>

            {showAll && (
              filteredEntries.length === 0 ? (
                <div className="text-sm text-neutral-600">No hay más estadísticas disponibles.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEntries.map((e: StatEntry) => (
                    <div key={`${e.code ?? e.description}`} className="rounded-xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 p-4">
                      <div className="text-xs text-neutral-500">{e.description}</div>
                      <div className="mt-1 text-xl font-semibold text-neutral-900">
                        {e.value ?? e.played ?? '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 p-4">
          No hay estadísticas disponibles por ahora.
        </div>
      )}
    </section>
  )
}