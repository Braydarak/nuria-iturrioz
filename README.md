# Sitio web de Nuria Iturrioz

Proyecto en React + TypeScript (Vite) para el sitio de Nuria Iturrioz. Incluye páginas públicas, navegación con React Router y componentes de estadísticas con datos externos.

## Tecnologías
- React + TypeScript
- Vite
- React Router
- Utilidades de estilo tipo Tailwind (clases utilitarias)

## Requisitos
- Node.js 18+
- npm

## Instalación y ejecución
```bash
npm install
npm run dev
```
Servidor de desarrollo: normalmente `http://localhost:5174/` (página de estadísticas en `http://localhost:5174/stats`).

## Scripts
- `npm run dev`: servidor de desarrollo con HMR
- `npm run build`: build para producción
- `npm run preview`: servir el build localmente

## Rutas principales
- `/`: Inicio
- `/carrer`: Carrera
- `/stats`: Estadísticas

## Componentes clave
- `src/components/season_stats/` — Resultados por temporada:
  - Ordena torneos de más nuevo a más antiguo.
  - Muestra 4 elementos por defecto con botón “Ver todos/Ver menos”.
  - Diferencia temporada actual (mismo límite y toggle) del resto.
  - Obtiene datos del endpoint LET: 
    `https://api.euro.ocs-software.com/let/cache/let/profiles/200899?...`

- `src/components/header/` — Cabecera fija con navegación (desktop y mobile).

- `src/pages/stats-page/` — Página “Estadísticas” con título en estilo `font-signature` y color azul corporativo.

## Fuentes y estilos
- Fuente de firma: `font-signature` (Momo Signature) definida en `src/index.css` y cargada en `index.html`.
- Clases utilitarias para colores, espaciado y tipografía.

## Estructura básica
```
src/
  components/
  pages/
  sections/
  main.tsx
  index.css
```

## Despliegue
Construye con `npm run build` y sirve el contenido de `dist/` en cualquier hosting estático.

## Notas
- Si cambias el endpoint o el esquema de datos, revisa el parser en `season_stats`.
- Ajustes de estilo (colores, fuentes) se centralizan en `index.css` y en clases utilitarias del JSX.
