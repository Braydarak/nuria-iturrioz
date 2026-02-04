import { useEffect, useState } from "react";

export default function PageIntro() {
  const [stage, setStage] = useState<"blue" | "collapse" | "fading" | "hidden">(
    "blue",
  );

  useEffect(() => {
    const collapseDurationMs = 1200;

    const tBlueEnd = setTimeout(() => setStage("collapse"), 2000);
    const tFadeStart = setTimeout(
      () => setStage("fading"),
      2000 + collapseDurationMs,
    );
    const tHidden = setTimeout(
      () => setStage("hidden"),
      2000 + collapseDurationMs + 300,
    );
    return () => {
      clearTimeout(tBlueEnd);
      clearTimeout(tFadeStart);
      clearTimeout(tHidden);
    };
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
