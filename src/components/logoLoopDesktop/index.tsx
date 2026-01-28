import { useMemo } from 'react'

type LogoLoopProps = {
  heightClass?: string
  className?: string
}

const LogoLoop = ({ heightClass = 'h-50', className = '' }: LogoLoopProps) => {
  // Carga dinámica de imágenes desde la carpeta sponsors
  const logos = useMemo(() => {
    const modules = import.meta.glob('../../assets/sponsors/*.{png,jpg,jpeg,svg,avif,webp}', {
      eager: true,
      as: 'url',
    }) as Record<string, string>
    // Ordena por nombre para un orden estable
    return Object.entries(modules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, url]) => url)
  }, [])

  // Duplicamos la lista para crear el bucle continuo
  const loopList = [...logos, ...logos]

  return (
    <div className={`logo-loop relative overflow-hidden bg-[#2A579E] ${heightClass} w-60 ${className}`}>
      {/* Estilos del componente: animación y difuminado */}
      <style>
        {`
          .logo-loop .loop-inner { will-change: transform; animation: scrollY 18s linear infinite; }
          @keyframes scrollY { 100% { transform: translateY(0); } 0% { transform: translateY(-50%); } }
          .logo-loop::before { content: ''; position: absolute; inset: 0; pointer-events: none;
            background: linear-gradient(to bottom,
              rgba(42, 87, 158, 0.85) 0%,
              rgba(42, 87, 158, 0.00) 15%,
              rgba(42, 87, 158, 0.00) 85%,
              rgba(42, 87, 158, 0.85) 100%);
          }
        `}
      </style>

      <div className="absolute inset-0">
        <div className="loop-inner">
          {/* Primera columna */}
          <div className="flex flex-col items-center">
            {loopList.map((src, idx) => (
              <img
                key={`logo-1-${idx}`}
                src={src}
                alt={`Sponsor ${idx + 1}`}
                className="h-60 w-auto object-contain"
                style={{ filter: 'grayscale(1) brightness(0) invert(1)' }}
              />
            ))}
          </div>
          {/* Segunda columna para continuidad, misma lista */}
          <div className="flex flex-col items-center">
            {loopList.map((src, idx) => (
              <img
                key={`logo-2-${idx}`}
                src={src}
                alt={`Sponsor ${idx + 1}`}
                className="h-20 w-auto object-contain"
                style={{ filter: 'grayscale(1) brightness(0) invert(1)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoLoop