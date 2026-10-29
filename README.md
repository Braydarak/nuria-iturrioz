# Nuria Iturrioz Website

A React + TypeScript (Vite) website for Nuria Iturrioz. It includes public pages, React Router navigation, and season statistics fetched from an external API.

Official site: https://nuriaiturrioz.com/

## English

- Technologies: React, TypeScript, Vite, React Router, utility-first CSS classes (Tailwind-like)
- Requirements: Node.js 18+, npm
- Setup:
  ```bash
  npm install
  npm run dev
  ```
  Dev server: typically `http://localhost:5174/` (Stats page: `http://localhost:5174/stats`).
- Scripts:
  - `npm run dev` — start dev server with HMR
  - `npm run build` — production build
  - `npm run preview` — preview built app locally
- Routes:
  - `/` — Home
  - `/carrer` — Career
  - `/stats` — Statistics
- Key Components:
  - `src/components/season_stats/` — Season results
    - Sorts tournaments newest → oldest
    - Shows 4 items by default with “Show all / Show less” toggle
    - Applies the same limit and toggle to current season
    - Data from LET endpoint: `https://api.euro.ocs-software.com/let/cache/let/profiles/200899?...`
  - `src/components/header/` — Fixed header with desktop/mobile navigation
  - `src/pages/stats-page/` — “Statistics” page, title uses `font-signature` in blue
- Fonts & Styles:
  - Signature font: `font-signature` (Momo Signature), defined in `src/index.css` and loaded in `index.html`
  - Utility classes for colors, spacing, and typography
- Structure:
  ```
  src/
    components/
    pages/
    sections/
    main.tsx
    index.css
  ```
- Deployment: build with `npm run build` and serve `dist/` on any static host
- Notes:
  - If the endpoint or data shape changes, update the parser in `season_stats`
  - Style adjustments (colors, fonts) are centralized in `index.css` and utility classes in JSX

---

## Español

Sitio en React + TypeScript (Vite) para Nuria Iturrioz. Incluye páginas públicas, navegación con React Router y estadísticas por temporada desde un API externo.

- Tecnologías: React, TypeScript, Vite, React Router, clases utilitarias tipo Tailwind
- Requisitos: Node.js 18+, npm
- Instalación:
  ```bash
  npm install
  npm run dev
  ```
  Servidor de desarrollo: `http://localhost:5174/` (Estadísticas: `http://localhost:5174/stats`).
- Scripts:
  - `npm run dev` — servidor de desarrollo con HMR
  - `npm run build` — build de producción
  - `npm run preview` — previsualizar el build
- Rutas:
  - `/` — Inicio
  - `/carrer` — Carrera
  - `/stats` — Estadísticas
- Componentes clave:
  - `src/components/season_stats/` — Resultados por temporada
    - Ordena de más nuevo a más antiguo
    - Muestra 4 por defecto con toggle “Ver todos / Ver menos”
    - Aplica el mismo límite y toggle a la temporada actual
    - Datos del endpoint LET: `https://api.euro.ocs-software.com/let/cache/let/profiles/200899?...`
  - `src/components/header/` — Cabecera fija con navegación desktop y mobile
  - `src/pages/stats-page/` — Página “Estadísticas” con título `font-signature` en azul
- Fuentes y estilos:
  - Fuente firma: `font-signature` (Momo Signature) en `src/index.css` y `index.html`
  - Clases utilitarias para colores, espaciados y tipografía
- Estructura:
  ```
  src/
    components/
    pages/
    sections/
    main.tsx
    index.css
  ```
- Despliegue: construir con `npm run build` y servir `dist/` en cualquier hosting estático
- Notas:
  - Si cambia el endpoint o el esquema, actualiza el parser en `season_stats`
  - Ajustes de estilo (colores, fuentes) en `index.css` y clases utilitarias

### Torneos (DB en Ferozo)

Los torneos ya no salen de `tournaments.json`: todo el backend está en la carpeta `ferozo/`. `api-web/sync-tournaments.php` lee el calendario del LET (`api.euro.ocs-software.com`), revisa el listado de *Entries* de cada torneo próximo y guarda en MySQL si Nuria (ID `200899`) está inscrita. La web los lee desde `/api-web/tournaments.php`.

```
ferozo/
  schema.sql            → ejecutar una vez en phpMyAdmin (no se sube a la web)
  api-web/              → subir a public_html/api-web/
    .htaccess
    config.example.php  → copiar como config.php con los datos de la DB
    lib.php
    sync-tournaments.php
    tournaments.php
```

1. Crear la base MySQL en Ferozo y ejecutar `ferozo/schema.sql` (phpMyAdmin).
2. Copiar `ferozo/api-web/config.example.php` a `ferozo/api-web/config.php` con los datos de la DB y un `sync_token` (está en `.gitignore`).
3. Subir la carpeta `ferozo/api-web/` a `public_html/api-web/`. Al subir `dist/` en futuros deploys, no borrar `public_html/api-web/`.
4. Lanzar la primera sincronización: `https://nuriaiturrioz.com/api-web/sync-tournaments.php?token=TU_TOKEN`.
5. Tarea programada (cron) en Ferozo, p. ej. días 1 y 15 de cada mes: `0 6 1,15 * * php /home/USUARIO/public_html/api-web/sync-tournaments.php`.

`confirmed` = inscrita (`Entered`); si es reserva queda en `false` y en `status` aparece `Reserve #N`. Para forzarlo a mano: columna `confirmed_override` (1 juega, 0 no juega, NULL automático).
En local, para usar la API de producción: `VITE_TOURNAMENTS_API_URL=https://nuriaiturrioz.com/api-web/tournaments.php npm run dev`.
