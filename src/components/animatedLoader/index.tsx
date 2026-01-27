
export default function AnimatedLoader() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', width: '100%', padding: '24px 0' }}>
      <style>
        {`
          .loader-svg { width: 320px; height: auto; }
          /* La barra permanece fija; sin salto ni movimiento horizontal */
          .bar { }
          /* El rect del reveal controla el recorte para aparecer desde izquierda y ocultarse hacia derecha */
          .revealRect { transform-origin: left center; animation: revealMotion 2s ease-in-out infinite; }

          @keyframes revealMotion {
            /* Aparece desde el lado izquierdo dentro de la caja */
            0% { transform: scaleX(0); transform-origin: left center; }
            40% { transform: scaleX(1); transform-origin: left center; }
            /* Cambio del origen para ocultarse hacia el lado derecho */
            50% { transform: scaleX(1); transform-origin: right center; }
            90% { transform: scaleX(0); transform-origin: right center; }
            /* Reinicia para volver a aparecer desde la izquierda */
            100% { transform: scaleX(0); transform-origin: left center; }
          }
        `}
      </style>

      <svg
        className="loader-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 674.02 296.87"
        preserveAspectRatio="xMinYMin meet"
      >
        <defs>
          {/* Caja que limita verticalmente la barra */}
          <clipPath id="barBox" clipPathUnits="userSpaceOnUse">
            <rect x="0" y="240" width="197" height="64" />
          </clipPath>
          {/* Reveal/hide dentro de la caja: aparece desde izquierda y se oculta hacia derecha */}
          <clipPath id="barReveal" clipPathUnits="userSpaceOnUse">
            <rect className="revealRect" x="0" y="240" width="197" height="64" />
          </clipPath>
        </defs>

        {/* Elementos azules estáticos del logo */}
        <path
          d="M25.94,0C34,0,42.12,0,50.21,0a2.1,2.1,0,0,1,1.9.93q24.12,31,48.28,62l60.66,77.92q17.87,22.95,35.7,45.94a3.23,3.23,0,0,1,.64,1.84c.07,2.58,0,5.15.05,7.73,0,.92-.24,1.28-1.21,1.27-16.42,0-32.85,0-49.27,0a2.44,2.44,0,0,1-1.62-1Q119.78,163.84,94.28,131L24.61,41.41Q12.69,26.08.76,10.72A3.87,3.87,0,0,1,.05,8.66C0,6.2.06,3.75,0,1.29,0,.29.3,0,1.31,0,9.52,0,17.73,0,25.94,0Z"
          transform="translate(0)"
          fill="#004b9f"
        />
        <path
          d="M.31,52.2l6,7.68q22.17,28.49,44.31,57a3.24,3.24,0,0,1,.65,1.84q0,38.76.05,77.52c0,1.12-.33,1.43-1.43,1.43q-24.15,0-48.29,0C0,197.63,0,197.62,0,196V52.31Z"
          transform="translate(0)"
          fill="#004b9f"
        />
        <path
          d="M197.34,145.37c-.32-.36-.56-.6-.77-.87q-24.91-32-49.8-64a3.69,3.69,0,0,1-.59-2.11c0-9.94,0-19.88,0-29.82V1.68c0-1.66,0-1.66,1.63-1.66h49.56Z"
          transform="translate(0)"
          fill="#004b9f"
        />

        {/* Barra inferior: estática (sin movimiento), recortada por caja + reveal */}
        <g clipPath="url(#barBox)">
          <g clipPath="url(#barReveal)" className="bar">
            <path
              d="M197.42,243.26v49.59c0,1.63,0,1.64-1.65,1.64H1.71c-1.68,0-1.69,0-1.69-1.65q0-24,0-48.06c0-1.19.28-1.56,1.54-1.55q97.2,0,194.41,0Z"
              transform="translate(0)"
              fill="#004b9f"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}