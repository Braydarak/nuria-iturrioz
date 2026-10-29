import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLetStatistics } from "../../data/useLetStatistics";
import { AnimateOnScroll } from "../../components/animation";

// Versiones redimensionadas a WebP (el recuadro mide como mucho 460px de ancho)
import nuria1 from "../../assets/nuria/web/Nuria1.webp";
import nuria2 from "../../assets/nuria/web/Nuria2.webp";
import nuria3 from "../../assets/nuria/web/Nuria3.webp";
import nuria4 from "../../assets/nuria/web/Nuria4.webp";
import nuria5 from "../../assets/nuria/web/Nuria5.webp";
import nuria6 from "../../assets/nuria/web/Nuria6.webp";
import nuria8 from "../../assets/nuria/web/Nuria8.webp";
import nuria10 from "../../assets/nuria/web/Nuria10.webp";
import nuria11 from "../../assets/nuria/web/Nuria11.webp";
import nuria12 from "../../assets/nuria/web/Nuria12.webp";

const nuriaImages = [
  nuria1,
  nuria2,
  nuria3,
  nuria4,
  nuria5,
  nuria6,
  nuria8,
  nuria10,
  nuria11,
  nuria12,
];

function useCountUp(target: number | null, duration = 2500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (
      target === null ||
      typeof target !== "number" ||
      !Number.isFinite(target)
    )
      return;
    let raf = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function toNumberSafe(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string") {
    const n = Number(String(v).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  return null;
}

const AboutMe = () => {
  const { t } = useTranslation();
  const { data, entries, loading, error, memberAge } = useLetStatistics();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || statsVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStatsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [statsVisible]);

  const tournamentsRaw = useMemo(() => {
    const byCode = entries.find((e) => e.code === "B010");
    const candidate =
      byCode ??
      entries.find(
        (e) =>
          e.description.toLowerCase().includes("tournament") &&
          e.description.toLowerCase().includes("tournaments"),
      );
    return (
      toNumberSafe(candidate?.tournaments) ??
      toNumberSafe(candidate?.played) ??
      toNumberSafe(candidate?.value) ??
      null
    );
  }, [entries]);

  const winsRaw = useMemo(() => {
    if (typeof data?.tournamentWins === "number") return data.tournamentWins;
    const fromEntries = entries.find(
      (e) => e.description.toLowerCase() === "tournament wins",
    );
    return toNumberSafe(fromEntries?.value);
  }, [data, entries]);

  const VISITED_COUNRTIES = 50;

  const age = useCountUp(statsVisible ? (memberAge ?? null) : null);
  const wins = useCountUp(statsVisible ? (winsRaw ?? null) : null);
  const tournaments = useCountUp(
    statsVisible ? (tournamentsRaw ?? null) : null,
  );
  const visited = useCountUp(statsVisible ? VISITED_COUNRTIES : null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sectionInView, setSectionInView] = useState(false);

  // El carrusel de fotos solo corre mientras la sección está en pantalla
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setSectionInView(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionInView) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % nuriaImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [sectionInView]);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative bg-linear-to-br from-[#1B3A75] via-[#2A579E] to-[#3C7BEA] text-white"
    >
      <div className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#3C7BEA]/20 blur-3xl" />

      <div className="mx-auto max-w-screen px-8 md:px-16 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <AnimateOnScroll
            as="div"
            className="relative"
            x={-80}
            y={0}
            scale={1}
          >
            <div className="absolute -top-4 -left-4 h-24 w-24 rounded-xl bg-[#A8D0FF]/20 blur-md" />
            <div
              className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20 w-full max-w-[380px] md:max-w-[460px]"
              style={{ aspectRatio: "3 / 4" }}
            >
              {nuriaImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Nuria Iturrioz ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ filter: "saturate(1.1) contrast(1.05)" }}
                />
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll
            as="div"
            className="space-y-4"
            x={80}
            y={0}
            scale={1}
          >
            <h2 className="inline-block font-signature text-4xl md:text-5xl font-semibold -rotate-2 drop-shadow">
              {t("aboutMe.title")}
            </h2>
            <svg
              className="mt-1"
              width="180"
              height="12"
              viewBox="0 0 180 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10 C 50 2, 130 2, 178 10"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <div className="space-y-6 text-xl font-light leading-relaxed md:text-2xl lg:text-3xl">
              <p>{t("aboutMe.p1_prefix")}</p>
              <p className="font-medium text-[#A8D0FF]">{t("aboutMe.p4")}</p>
            </div>

            <div className="pt-2">
              <Link
                to="/carrer"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-base font-bold text-[#1B3A75] shadow-lg transition-colors hover:bg-[#E6F0FF] md:text-lg"
              >
                {t("aboutMe.cta")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6 transition-transform group-hover:translate-x-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.75 21 12l-3.75 3.25M3 12h18"
                  />
                </svg>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
        {!loading && !error && (
          <AnimateOnScroll x={0} y={30} scale={1} className="mt-16 md:mt-20">
            <dl className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-blue-100/80 md:text-xs">
                  {t("aboutMe.stats.age")}
                </dt>
                <dd className="order-first font-signature text-6xl leading-tight tracking-tight text-white sm:text-7xl">
                  {age}
                </dd>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-blue-100/80 md:text-xs">
                  {t("aboutMe.stats.wins")}
                </dt>
                <dd className="order-first font-signature text-6xl leading-tight tracking-tight text-white sm:text-7xl">
                  {wins ?? 0}
                </dd>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-blue-100/80 md:text-xs">
                  {t("aboutMe.stats.played")}
                </dt>
                <dd className="order-first font-signature text-6xl leading-tight tracking-tight text-white sm:text-7xl">
                  {tournaments ?? 0}
                </dd>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-blue-100/80 md:text-xs">
                  {t("aboutMe.stats.countries")}
                </dt>
                <dd className="order-first font-signature text-6xl leading-tight tracking-tight text-white sm:text-7xl">
                  +{visited}
                </dd>
              </div>
            </dl>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
};

export default AboutMe;
