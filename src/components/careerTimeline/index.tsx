import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Párrafos de la trayectoria que se cuentan como hitos (p1 abre la página y
// p7 cierra la línea). Las etiquetas están en career.milestones, en el mismo orden.
const MILESTONE_PARAGRAPHS = ["p2", "p3", "p4", "p5", "p6"] as const;

export default function CareerTimeline() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const milestoneLabels = t("career.milestones", {
    returnObjects: true,
  }) as string[];

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // El eje se va "dibujando" a medida que se hace scroll
      gsap.fromTo(
        "[data-timeline-progress]",
        { scaleY: 0, transformOrigin: "50% 0%" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-timeline-list]",
            start: "top 65%",
            end: "bottom 65%",
            scrub: 0.6,
          },
        },
      );

      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean };

          gsap.utils
            .toArray<HTMLElement>("[data-timeline-item]")
            .forEach((item) => {
              const fromLeft = desktop && item.dataset.side === "left";
              const dot = item.querySelector("[data-timeline-dot]");
              const ring = item.querySelector("[data-timeline-ring]");
              const label = item.querySelector("[data-timeline-label]");
              const text = item.querySelector("[data-timeline-text]");

              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: item,
                  // Se activa cuando la línea de progreso llega al punto
                  start: "top 65%",
                  toggleActions: "play none none reverse",
                },
                defaults: { ease: "power3.out" },
              });

              tl.fromTo(
                dot,
                { scale: 0.4, backgroundColor: "#C9D6EA" },
                {
                  scale: 1,
                  backgroundColor: "#2A579E",
                  duration: 0.45,
                  ease: "back.out(3)",
                },
              )
                .fromTo(
                  ring,
                  { scale: 0.6, autoAlpha: 0.8 },
                  {
                    scale: 2.6,
                    autoAlpha: 0,
                    duration: 0.9,
                    ease: "power2.out",
                  },
                  "<",
                )
                .fromTo(
                  label,
                  { autoAlpha: 0, x: fromLeft ? -40 : 40 },
                  { autoAlpha: 1, x: 0, duration: 0.6 },
                  "<0.1",
                )
                .fromTo(
                  text,
                  { autoAlpha: 0, x: fromLeft ? -60 : 60, y: 10 },
                  { autoAlpha: 1, x: 0, y: 0, duration: 0.8 },
                  "<0.08",
                );
            });
        },
      );

      // Cierre: la frase se "escribe" de izquierda a derecha
      gsap.fromTo(
        "[data-timeline-closing]",
        { clipPath: "inset(-25% 100% -25% -5%)" },
        {
          clipPath: "inset(-25% -5% -25% -5%)",
          duration: 1.6,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "[data-timeline-closing]",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, section);

    // Fuentes, imágenes y secciones que crecen cambian el alto de la página
    // después de crear los triggers: se recalculan cuando eso pasa
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F8FAFD] py-20 md:py-28"
    >
      <ol data-timeline-list className="relative mx-auto max-w-5xl px-6">
        {/* Eje: base tenue + progreso que se dibuja con el scroll */}
        <div className="absolute bottom-0 left-[31px] top-0 w-0.5 bg-[#2A579E]/15 md:left-1/2 md:-translate-x-1/2" />
        <div
          data-timeline-progress
          className="absolute bottom-0 left-[31px] top-0 w-0.5 origin-top bg-linear-to-b from-[#1B3A75] via-[#2A579E] to-[#3C7BEA] md:left-1/2 md:-translate-x-1/2"
        />

        {MILESTONE_PARAGRAPHS.map((key, index) => {
          const right = index % 2 === 1;
          return (
            <li
              key={key}
              data-timeline-item
              data-side={right ? "right" : "left"}
              className={`relative mb-12 pl-12 last:mb-0 md:mb-16 md:w-1/2 md:pl-0 ${
                right ? "md:ml-auto md:pl-14" : "md:pr-14 md:text-right"
              }`}
            >
              {/* Punto del eje */}
              <span
                className={`absolute left-[-2px] top-1 h-5 w-5 ${
                  right ? "md:-left-2.5" : "md:left-auto md:-right-2.5"
                }`}
              >
                <span
                  data-timeline-ring
                  className="absolute inset-0 rounded-full border-2 border-[#2A579E] opacity-0"
                />
                <span
                  data-timeline-dot
                  className="absolute inset-0 rounded-full border-4 border-[#F8FAFD] bg-[#2A579E] shadow-[0_0_0_2px_rgba(42,87,158,0.3)]"
                />
              </span>

              <p
                data-timeline-label
                className="text-sm font-bold uppercase tracking-[0.2em] text-[#2A579E]"
              >
                {milestoneLabels[index]}
              </p>
              <p
                data-timeline-text
                className="mt-3 text-lg leading-relaxed text-gray-700 md:text-xl"
              >
                {t(`career.${key}`)}
              </p>
            </li>
          );
        })}
      </ol>

      <p
        data-timeline-closing
        className="mx-auto mt-20 w-fit px-4 text-center font-signature text-4xl text-[#2A579E] md:text-5xl"
      >
        {t("career.p7")}
      </p>
    </section>
  );
}
