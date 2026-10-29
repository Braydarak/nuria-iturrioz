import { useEffect, useState } from "react";

// Tiempo mínimo que se ve el logo (contado desde que el navegador empieza a
// pintar la página en la primera carga, porque el HTML prerenderizado ya
// muestra el fondo azul antes de que arranque React).
const MIN_VISIBLE_MS = 1800;
// Si alguna imagen tarda demasiado, no bloqueamos la web indefinidamente.
const MAX_WAIT_MS = 8000;
const COLLAPSE_DURATION_MS = 1200;
const FADE_DURATION_MS = 300;

// El intro solo se muestra al entrar a la web por la home: si se entra por
// otra página, o si ya se vio, navegar a Inicio no lo vuelve a mostrar.
function isHomePath(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return path === "" || path === "/" || path === "/index.html";
}

let introPending =
  typeof window !== "undefined" && isHomePath(window.location.pathname);

if (!introPending && typeof document !== "undefined") {
  document.documentElement.dataset.pageIntro = "hidden";
}

function waitForWindowLoad() {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) =>
    window.addEventListener("load", () => resolve(), { once: true }),
  );
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
    if (img.complete) resolve();
  });
}

// Espera a las imágenes visibles al cargar: <img> que no son lazy y fondos
// definidos con style="background-image: url(...)" (p. ej. el hero).
function waitForImages() {
  const sources = new Set<string>();
  document
    .querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])')
    .forEach((img) => {
      if (img.currentSrc || img.src) sources.add(img.currentSrc || img.src);
    });
  document
    .querySelectorAll<HTMLElement>('[style*="background-image"]')
    .forEach((el) => {
      const match = el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (match?.[1]) sources.add(match[1]);
    });
  return Promise.all([waitForWindowLoad(), ...[...sources].map(preloadImage)]);
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export default function PageIntro() {
  const [stage, setStage] = useState<"blue" | "collapse" | "fading" | "hidden">(
    () => (introPending ? "blue" : "hidden"),
  );

  useEffect(() => {
    if (stage === "hidden") return;
    document.documentElement.dataset.pageIntro = "active";

    // Durante el prerender (Puppeteer) dejamos el intro en azul para que el
    // HTML estático arranque igual que React y no se vea la web antes de tiempo.
    if (navigator.webdriver) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Contado desde el inicio de la carga: el HTML prerenderizado ya mostraba el azul
    const minVisible = MIN_VISIBLE_MS - performance.now();

    Promise.race([
      Promise.all([wait(minVisible), waitForImages()]),
      wait(MAX_WAIT_MS),
    ]).then(() => {
      if (cancelled) return;
      setStage("collapse");
      timers.push(
        setTimeout(() => setStage("fading"), COLLAPSE_DURATION_MS),
        setTimeout(() => {
          introPending = false;
          document.documentElement.dataset.pageIntro = "hidden";
          window.dispatchEvent(new CustomEvent("page-intro:hidden"));
          setStage("hidden");
        }, COLLAPSE_DURATION_MS + FADE_DURATION_MS),
      );
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // Solo se decide al montar; los cambios de stage los maneja este efecto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stage === "hidden") return null;

  const fadingClass =
    stage === "fading" ? "opacity-0 transition-opacity duration-300" : "";

  return (
    <div className={`fixed inset-0 z-40 pointer-events-none ${fadingClass}`}>
      <style>
        {`
          :root { --intro-blue: #2A579E; }

          /* Lleno azul */
          .intro-fill { position: absolute; inset: 0; background-color: var(--intro-blue); }

          /* Puerta única */
          .door { position: absolute; top: 0; bottom: 0; background-color: var(--intro-blue); }
          
          /* Mobile default: vertical wipe (top to bottom reveal) */
          .door-single { 
            left: 0; 
            width: 100%; 
            transform-origin: bottom; 
            transform: scaleY(1); 
          }

          /* Logo centrado */
          .logo { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 160px; height: 160px; background-color: white; z-index: 9999; 
          /* WebKit */
          -webkit-mask-image: url('/NuriaLogo.blue.svg');
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          -webkit-mask-size: contain;
          /* Standard */
          mask-image: url('/NuriaLogo.blue.svg');
          mask-repeat: no-repeat;
          mask-position: center;
          mask-size: contain;
          }
          
          .run-close { animation: doorCloseMobile 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

          @keyframes doorCloseMobile {
            from { transform: scaleY(1); }
            to   { transform: scaleY(0); }
          }

          /* Desktop: horizontal wipe (original behavior) */
          @media (min-width: 768px) {
            .door-single { 
              transform-origin: right; 
              transform: scaleX(1); 
            }
            
            .run-close { animation: doorCloseDesktop 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
          }

          @keyframes doorCloseDesktop {
            from { transform: scaleX(1); }
            to   { transform: scaleX(0); }
          }
        `}
      </style>

      {/* Logo centrado en blanco con filter y fade-out al cerrar */}
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${stage === "blue" ? "opacity-100" : "opacity-0"}`}
      >
        <img
          src="/NuriaLogo.Iso_.ok-02.svg"
          alt="Nuria Logo"
          className="pointer-events-none w-28 h-auto sm:w-36 md:w-44 lg:w-52 "
        />
      </div>

      {/* Stage: azul completo */}
      {stage === "blue" && <div className="intro-fill" />}

      {/* Stage: puertas cerrando (left primero, right cuando left llega ~20%) */}
      {stage !== "blue" && (
        <div className="absolute inset-0">
          <div className="door door-single run-close" />
        </div>
      )}
    </div>
  );
}
