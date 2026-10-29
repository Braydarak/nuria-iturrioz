import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LetCareer } from "../../data/letCareer";
import { useInView } from "../../hooks/useInView";

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function CountUp({ value, start }: { value: number; start: boolean }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!start || reduceMotion()) return;
    let raf = 0;
    const t0 = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      // ease-out
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  return <>{start && reduceMotion() ? value : shown}</>;
}

export default function CareerKpis({ career }: { career: LetCareer }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView<HTMLDListElement>(0.3);
  const wins = career.stats.get("B010");
  const top10 = career.stats.get("B020");

  const kpis = [
    { label: t("statsPage.kpis.wins"), value: wins?.value },
    { label: t("statsPage.kpis.top10"), value: top10?.value },
    { label: t("statsPage.kpis.tournaments"), value: wins?.tournaments },
    { label: t("statsPage.kpis.seasons"), value: wins?.seasons },
  ].filter((k): k is { label: string; value: number } => k.value != null);

  return (
    <dl
      ref={ref}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#2A579E]/10 bg-[#2A579E]/10 lg:grid-cols-4"
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="flex flex-col gap-1 bg-white px-4 py-5 md:px-5 md:py-6"
        >
          <dt className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 md:text-xs md:tracking-[0.15em]">
            {kpi.label}
          </dt>
          <dd className="text-3xl font-semibold text-[#1B3A75] sm:text-4xl md:text-5xl">
            <CountUp value={kpi.value} start={inView} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
