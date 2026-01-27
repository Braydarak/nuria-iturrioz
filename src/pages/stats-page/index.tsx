import SeasonStats from '../../components/season_stats'
import StatsSection from '../../sections/stats'

export default function StatsPage() {
  return (
    <main className="mx-auto max-w-screen mt-40">
      {/* Bloque superior: Season Stats con fondo blanco */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">Estadísticas</h1>
            <p className="mt-2 text-sm text-neutral-600">Resumen por temporadas y métricas destacadas.</p>
            {/* Descripción de la sección de estadísticas */}
            <p className="mt-4 text-base text-neutral-700">
              En esta sección os mostramos un poco sobre mis estadísticas en el Ladies European Tour:
              primero, los resultados por temporada; debajo, otras métricas destacadas.
            </p>
          </header>
        </div>
        <SeasonStats />
      </section>

      {/* Bloque inferior: otras estadísticas con fondo azul y textura sutil */}
      <section className="relative">
        <style>{`
          .stats-blue-bg {
            position: absolute; inset: 0; z-index: 0;
            background-image:
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 40%),
              radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 45%),
              radial-gradient(circle at 30% 80%, rgba(255,255,255,0.06), transparent 45%),
              linear-gradient(135deg, #173a70 0%, #2A579E 40%, #1f4a8f 100%);
          }
          /* Sutil patrón de puntos para evitar azul plano */
          .stats-blue-dots {
            position: absolute; inset: 0; z-index: 0; opacity: 0.35; pointer-events: none;
            background:
              radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 2px) 0 0/26px 26px,
              radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 2px) 13px 13px/26px 26px;
          }
        `}</style>

        <div className="stats-blue-bg" />
        <div className="stats-blue-dots" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <StatsSection />
        </div>
      </section>
    </main>
  )
}