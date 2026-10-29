import { useTranslation } from "react-i18next";
import type { CareerStat, LetCareer } from "../../data/letCareer";
import { useInView } from "../../hooks/useInView";

type Metric = {
  code: string;
  kind: "percent" | "value";
  unit?: string;
};

function Meter({
  stat,
  label,
  animate,
}: {
  stat: CareerStat;
  label: string;
  animate: boolean;
}) {
  const value = stat.value ?? 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-white/85">{label}</span>
        <span className="text-xl font-semibold text-white">
          {value.toFixed(1)}
          <span className="ml-0.5 text-sm font-normal text-white/70">%</span>
        </span>
      </div>
      {/* El riel es un tono más claro del mismo azul */}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-white"
          style={{
            width: animate ? `${Math.min(value, 100)}%` : "0%",
            transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}

function Tile({
  stat,
  label,
  unit,
}: {
  stat: CareerStat;
  label: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-3 md:px-4">
      <div className="text-xs text-white/80 md:text-sm">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white md:text-2xl">
        {stat.raw}
        {unit && (
          <span className="ml-1 text-sm font-normal text-white/70">{unit}</span>
        )}
      </div>
    </div>
  );
}

export default function GameMetrics({ career }: { career: LetCareer }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  const groups: { title: string; metrics: Metric[] }[] = [
    {
      title: t("statsPage.game.tee"),
      metrics: [
        { code: "S155", kind: "value", unit: t("statsPage.game.yards") },
        { code: "S150", kind: "percent" },
      ],
    },
    {
      title: t("statsPage.game.approach"),
      metrics: [
        { code: "S160", kind: "percent" },
        { code: "S170", kind: "value" },
        { code: "S175", kind: "value" },
      ],
    },
    {
      title: t("statsPage.game.shortGame"),
      metrics: [
        { code: "S165", kind: "percent" },
        { code: "S178", kind: "percent" },
        { code: "S177", kind: "percent" },
      ],
    },
    {
      title: t("statsPage.game.scoring"),
      metrics: [
        { code: "S100", kind: "value" },
        { code: "S105", kind: "value" },
        { code: "S116", kind: "value" },
        { code: "S115", kind: "value" },
        { code: "S110", kind: "value" },
        { code: "S120", kind: "value" },
      ],
    },
  ];
  const labelOf = (code: string) => t(`statsPage.game.labels.${code}`);

  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-2 md:gap-6">
      {groups.map((group) => {
        const available = group.metrics.filter(
          (m) => career.stats.get(m.code)?.value != null,
        );
        if (!available.length) return null;
        const meters = available.filter((m) => m.kind === "percent");
        const tiles = available.filter((m) => m.kind === "value");
        return (
          <section
            key={group.title}
            className="rounded-2xl border border-white/15 bg-white/5 p-5 md:p-6"
          >
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
              {group.title}
            </h3>
            {meters.length > 0 && (
              <div className="space-y-5">
                {meters.map((m) => (
                  <Meter
                    key={m.code}
                    stat={career.stats.get(m.code)!}
                    label={labelOf(m.code)}
                    animate={inView}
                  />
                ))}
              </div>
            )}
            {tiles.length > 0 && (
              <div
                className={`grid grid-cols-2 gap-3 ${meters.length ? "mt-6" : ""}`}
              >
                {tiles.map((m) => (
                  <Tile
                    key={m.code}
                    stat={career.stats.get(m.code)!}
                    label={labelOf(m.code)}
                    unit={m.unit}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
