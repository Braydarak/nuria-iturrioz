import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import nuri from "../../assets/nuri.png";
import { useLetStatistics } from "../../data/useLetStatistics";

function useCountUp(target: number | null, duration = 1200) {
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
  const { data, entries, loading, error, memberAge } = useLetStatistics();

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

  const VISITED_COUNRTIES = 20;

  const age = useCountUp(memberAge ?? null);
  const wins = useCountUp(winsRaw ?? null);
  const tournaments = useCountUp(tournamentsRaw ?? null);
  const visited = useCountUp(VISITED_COUNRTIES);

  return (
    <section className="relative bg-linear-to-br from-[#1B3A75] via-[#2A579E] to-[#3C7BEA] text-white">
      <div className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#3C7BEA]/20 blur-3xl" />
      <style>{`
        @keyframes arrowNudge { 0% { transform: translateX(0); } 50% { transform: translateX(6px); } 100% { transform: translateX(0); } }
      `}</style>

      <div className="mx-auto max-w-screen px-8 md:px-16 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 h-24 w-24 rounded-xl bg-[#A8D0FF]/20 blur-md" />
            <div
              className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20 w-full max-w-[380px] md:max-w-[460px]"
              style={{ aspectRatio: "3 / 4" }}
            >
              <img
                src={nuri}
                alt="Nuria Iturrioz"
                className="h-full w-full object-cover"
                style={{ filter: "saturate(1.1) contrast(1.05)" }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="inline-block font-signature text-4xl md:text-5xl font-semibold -rotate-2 drop-shadow">
              Sobre mí
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
            <div className="text-2xl leading-relaxed">
              <p className="mt-4">
                Me llamo Nuria Iturrioz y{" "}
                <strong className="bg-clip-text text-transparent bg-linear-to-r from-white to-[#A8D0FF]">
                  quiero llegar a lo más alto del golf femenino mundial
                </strong>
                .
              </p>
              <p className="mt-4">
                Aquí podréis saber un poco más de mí, de mi pasado, mi presente
                y mi futuro.
              </p>
              <p className="mt-4">
                ¡Espero que os guste y podáis disfrutar de mi carrera
                acompañándome por todo el mundo!
              </p>
              <p className="mt-4">Gracias por vuestro apoyo.</p>
            </div>

            <div className="pt-2">
              <Link
                to="/career"
                className="group inline-flex items-center gap-3 rounded-full bg-white text-[#1B3A75] px-8 py-4 text-lg md:text-xl font-bold shadow-lg ring-1 ring-white/60 hover:bg-[#E6F0FF] hover:shadow-xl hover:ring-white transition-all duration-200"
              >
                Animate a conocer mas sobre mí
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-7 w-7 transform transition-transform group-hover:translate-x-1"
                  style={{ animation: "arrowNudge 1.4s ease-in-out infinite" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.75 21 12l-3.75 3.25M3 12h18"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        {!loading && !error && (
          <div className="pt-30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center text-center">
              <div>
                <div className="font-signature text-6xl sm:text-7xl text-white leading-tight tracking-tight">
                  {age}
                </div>
                <div className="mt-2 text-xl sm:text-2xl text-white">Edad</div>
              </div>
              <div>
                <div className="font-signature text-6xl sm:text-7xl text-white leading-tight tracking-tight">
                  {wins ?? 0}
                </div>
                <div className="mt-2 text-xl sm:text-2xl text-white">
                  Victorias LET
                </div>
              </div>
              <div>
                <div className="font-signature text-6xl sm:text-7xl text-white leading-tight tracking-tight">
                  {tournaments ?? 0}
                </div>
                <div className="mt-2 text-xl sm:text-2xl text-white">
                  Torneos jugados
                </div>
              </div>
              <div>
                <div className="font-signature text-6xl sm:text-7xl text-white leading-tight tracking-tight">
                  {visited}
                </div>
                <div className="mt-2 text-xl sm:text-2xl text-white">
                  Países visitados
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutMe;
