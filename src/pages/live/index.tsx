import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import nuriImg from "../../assets/nuria/Nuria9.jpg";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import AnimatedLoader from "../../components/animatedLoader";
import { DEFAULT_OG_IMAGE_URL, SITE_URL } from "../../utils/constants";
import { refresh, useLive } from "../../live/liveStore";
import type { HoleScore, LiveSnapshot, RoundCard } from "../../live/parse";

const BLUE = "#2A579E";

const formatToPar = (value: number | null) =>
  value === null
    ? "–"
    : value === 0
      ? "E"
      : value > 0
        ? `+${value}`
        : `${value}`;

// "hace 2 minutos" en el idioma de la web
const useTimeAgo = (date: Date | null, lang: string) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  if (!date) return "";
  const seconds = Math.round((date.getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  if (Math.abs(seconds) < 60) return rtf.format(Math.min(seconds, 0), "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  return rtf.format(Math.round(minutes / 60), "hour");
};

const Dots = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 opacity-40"
    style={{
      background:
        "radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 2px) 0 0/26px 26px, radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 2px) 13px 13px/26px 26px",
    }}
  />
);

const Container = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto max-w-6xl px-5 sm:px-6">{children}</div>
);

const SectionTitle = ({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) => (
  <header className="mb-6 text-center md:mb-8 md:text-left">
    <h2
      className={`font-signature text-3xl sm:text-4xl md:text-5xl ${
        light ? "text-white" : "text-[#2A579E]"
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p className={`mt-2 ${light ? "text-blue-100/80" : "text-neutral-600"}`}>
        {subtitle}
      </p>
    )}
  </header>
);

const LivePage = () => {
  const { t, i18n } = useTranslation("global");
  const lang = (i18n.resolvedLanguage || i18n.language || "es").split("-")[0];
  const live = useLive();
  const snap = live.snapshot;
  const [refreshing, setRefreshing] = useState(false);
  const updatedAgo = useTimeAgo(snap?.updatedAt ?? live.lastFetchedAt, lang);

  const title = "En vivo – Nuria Iturrioz";
  const description =
    "Seguimiento en vivo de torneos y estado competitivo de Nuria Iturrioz cuando haya información disponible.";
  const url = `${SITE_URL}/live`;

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const seo = (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE_URL} />
      <meta property="og:site_name" content="Nuria Iturrioz" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE_URL} />
    </Helmet>
  );

  if (live.status === "loading" && !snap) {
    return (
      <>
        {seo}
        <main className="flex min-h-screen items-center justify-center bg-white">
          <AnimatedLoader />
        </main>
      </>
    );
  }

  if (!snap) {
    return (
      <>
        {seo}
        <NoLive refreshing={refreshing} onRefresh={onRefresh} />
      </>
    );
  }

  return (
    <>
      {seo}
      <main className="w-full bg-white pt-[68px] md:pt-[84px]">
        <LiveHero snap={snap} stale={!!live.error} />
        <ScorecardSection snap={snap} />
        <RoundsSection snap={snap} />

        <section className="border-t border-[#E6E6E6] bg-white py-8">
          <Container>
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-neutral-500 md:flex-row">
              <p className="text-center md:text-left">
                {t("livePage.autoUpdate")}
                {updatedAgo &&
                  ` · ${t("livePage.updatedAgo", { ago: updatedAgo })}`}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="rounded-full border border-[#E6E6E6] px-4 py-2 font-semibold text-neutral-800 transition-colors hover:bg-[#F8F8F8] disabled:opacity-60"
                >
                  {refreshing ? "…" : t("livePage.refreshData")}
                </button>
                <a
                  href="https://ladieseuropeantour.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1d3f78] px-4 py-2 font-bold uppercase tracking-wider text-white text-xs transition-colors hover:bg-[#2A579E]"
                >
                  {t("livePage.viewFullStats")}{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
};

/* ---------- Encabezado tipo transmisión ---------- */

const LiveHero = ({ snap, stale }: { snap: LiveSnapshot; stale: boolean }) => {
  const { t } = useTranslation("global");
  const onCourse = snap.state === "on-course";

  let status: string;
  if (snap.state === "not-started") {
    status = snap.teeTime
      ? t("livePage.state.teeTime", {
          round: snap.round,
          time: snap.teeTime,
          tee: snap.startTee,
        })
      : t("livePage.state.notStarted", { round: snap.round });
  } else if (onCourse) {
    status = t("livePage.state.onCourse", {
      round: snap.round,
      count: snap.holesPlayed,
    });
  } else if (snap.state === "round-finished") {
    status = t("livePage.state.roundFinished", { round: snap.round });
  } else if (snap.state === "tournament-finished") {
    status = t("livePage.state.tournamentFinished");
  } else {
    status = t("livePage.state.out", { label: snap.outLabel });
  }

  const [logoFailed, setLogoFailed] = useState(false);

  const thruHint =
    snap.state === "on-course" && snap.currentHole
      ? `${t("livePage.onHole", { hole: snap.currentHole })}${
          snap.currentHoleStrokes
            ? ` · ${snap.currentHoleStrokes} ${t("livePage.stroke", {
                count: snap.currentHoleStrokes,
              })}`
            : ""
        }`
      : snap.state === "not-started"
        ? t("livePage.fromTee", { tee: snap.startTee })
        : undefined;

  const thruValue =
    snap.state === "on-course"
      ? String(snap.holesPlayed)
      : snap.state === "not-started"
        ? (snap.teeTime ?? "–")
        : "F";

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#173a70] via-[#2A579E] to-[#1f4a8f] py-10 text-white md:py-16">
      <Dots />
      <Container>
        {/* Torneo + logo del torneo (el LET lo publica en event_sponsor_logo) */}
        <div className="flex flex-col-reverse items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-100/80">
              {onCourse ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  <span className="text-white">{t("livePage.live")}</span>
                </>
              ) : (
                t("livePage.eyebrow")
              )}
            </p>
            <h1 className="mt-3 font-title text-3xl font-extrabold leading-tight md:text-5xl">
              {snap.tournamentName}
            </h1>
            <p className="mt-2 text-sm text-blue-100/80 md:text-base">
              {snap.location}
              {snap.dates && <span className="mx-2 opacity-60">·</span>}
              {snap.dates}
            </p>
          </div>
          {snap.logoUrl && !logoFailed && (
            <div className="flex h-20 w-36 shrink-0 items-center justify-center rounded-xl bg-white p-3 shadow-lg md:h-28 md:w-48 md:p-4">
              <img
                src={snap.logoUrl}
                alt={snap.tournamentName}
                onError={() => setLogoFailed(true)}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Jugadora */}
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-white/15 pt-8 md:mt-10 md:justify-start md:pt-10">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/80 shadow-xl md:h-20 md:w-20">
            <img
              src={nuriImg}
              alt="Nuria Iturrioz"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="text-left">
            <p className="font-signature text-3xl leading-none md:text-4xl">
              Nuria Iturrioz
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-100/80">
              {t("livePage.roundOf", {
                round: snap.round,
                total: snap.totalRounds,
              })}
            </p>
          </div>
        </div>

        {/* Marcador */}
        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <ScoreTile
            label={t("livePage.position")}
            value={snap.position?.label ?? "–"}
            accent
          />
          <ScoreTile
            label={t("livePage.total")}
            value={formatToPar(snap.totalToPar)}
          />
          <ScoreTile
            label={t("livePage.today")}
            value={
              snap.state === "not-started" ? "–" : formatToPar(snap.roundToPar)
            }
          />
          <ScoreTile
            label={
              snap.state === "not-started"
                ? t("livePage.teeTimeLabel")
                : t("livePage.thru")
            }
            value={thruValue}
            hint={thruHint}
          />
        </dl>

        <p className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold md:text-left">
          {status}
        </p>
        {stale && (
          <p
            role="status"
            className="mt-3 rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-3 text-center text-sm text-amber-50 md:text-left"
          >
            {t("livePage.staleWarning")}
          </p>
        )}
      </Container>
    </section>
  );
};

const ScoreTile = ({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) => (
  <div
    className={`flex min-h-[7.5rem] flex-col rounded-xl border p-4 md:min-h-[8.5rem] md:p-5 ${
      accent
        ? "border-white/40 bg-white text-[#173a70]"
        : "border-white/15 bg-white/10"
    }`}
  >
    <dt
      className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
        accent ? "text-[#2A579E]/70" : "text-blue-100/80"
      }`}
    >
      {label}
    </dt>
    <dd className="mt-2 font-title text-4xl font-extrabold tabular-nums leading-none md:text-5xl">
      {value}
    </dd>
    {/* Siempre ocupa su lugar, así los números quedan alineados */}
    <dd
      className={`mt-auto pt-2 text-xs ${
        accent ? "text-neutral-500" : "text-blue-100/80"
      }`}
    >
      {hint ?? "\u00a0"}
    </dd>
  </div>
);

/* ---------- Tarjeta hoyo a hoyo ---------- */

// Notación de golf: birdie = círculo, eagle = doble círculo,
// bogey = cuadrado, doble bogey o peor = doble cuadrado
const ScoreMark = ({
  hole,
  current,
}: {
  hole: HoleScore;
  current: boolean;
}) => {
  if (hole.strokes === null) {
    return (
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold sm:h-10 sm:w-10 ${
          current
            ? "animate-pulse border-2 border-dashed border-[#2A579E] text-[#2A579E]"
            : "text-neutral-300"
        }`}
      >
        {current ? "●" : "·"}
      </span>
    );
  }
  const diff = hole.strokes - hole.par;
  const base =
    "flex h-6 w-6 items-center justify-center text-[11px] font-extrabold tabular-nums sm:h-10 sm:w-10 sm:text-base";
  if (diff <= -2)
    return (
      <span
        className={`${base} rounded-full bg-[#2A579E] text-white ring-2 ring-[#2A579E] ring-offset-1 sm:ring-offset-2`}
      >
        {hole.strokes}
      </span>
    );
  if (diff === -1)
    return (
      <span
        className={`${base} rounded-full border-2 border-[#2A579E] text-[#2A579E]`}
      >
        {hole.strokes}
      </span>
    );
  if (diff === 1)
    return (
      <span
        className={`${base} rounded-sm border-2 border-neutral-800 text-neutral-900`}
      >
        {hole.strokes}
      </span>
    );
  if (diff >= 2)
    return (
      <span
        className={`${base} rounded-sm bg-neutral-900 text-white ring-2 ring-neutral-900 ring-offset-1 sm:ring-offset-2`}
      >
        {hole.strokes}
      </span>
    );
  return <span className={`${base} text-neutral-900`}>{hole.strokes}</span>;
};

const NineTable = ({
  holes,
  label,
  currentHole,
}: {
  holes: HoleScore[];
  label: string;
  currentHole: number | null;
}) => {
  const { t } = useTranslation("global");
  const parTotal = holes.reduce((s, h) => s + h.par, 0);
  const played = holes.filter((h) => h.strokes !== null);
  const strokesTotal = played.reduce((s, h) => s + (h.strokes ?? 0), 0);
  const cols =
    "grid grid-cols-[3.4rem_repeat(9,minmax(0,1fr))_2.2rem] sm:grid-cols-[4.5rem_repeat(9,minmax(0,1fr))_3.5rem] items-center";

  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
        {label}
      </p>
      <div className="overflow-hidden rounded-xl border border-[#E6E6E6]">
        <div
          className={`${cols} bg-[#F8FAFD] py-2 text-center text-xs font-bold text-neutral-500`}
        >
          <span className="text-left pl-2 sm:pl-3 text-[9px] sm:text-[10px] uppercase tracking-wider">
            {t("livePage.hole")}
          </span>
          {holes.map((h) => (
            <span
              key={h.number}
              className={h.number === currentHole ? "text-[#2A579E]" : ""}
            >
              {h.number}
            </span>
          ))}
          <span className="text-[10px] uppercase tracking-wider">
            {t("livePage.totalShort")}
          </span>
        </div>
        <div
          className={`${cols} border-t border-[#E6E6E6] py-1.5 text-center text-xs text-neutral-500`}
        >
          <span className="text-left pl-2 sm:pl-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
            {t("livePage.par")}
          </span>
          {holes.map((h) => (
            <span key={h.number}>{h.par}</span>
          ))}
          <span className="font-bold">{parTotal}</span>
        </div>
        <div className={`${cols} border-t border-[#E6E6E6] py-2`}>
          <span className="text-left pl-2 sm:pl-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#2A579E]">
            {t("livePage.strokes")}
          </span>
          {holes.map((h) => (
            <span key={h.number} className="flex justify-center">
              <ScoreMark hole={h} current={h.number === currentHole} />
            </span>
          ))}
          <span className="text-center font-title text-base font-extrabold text-neutral-900 sm:text-lg">
            {played.length ? strokesTotal : "–"}
          </span>
        </div>
      </div>
    </div>
  );
};

const Legend = () => {
  const { t } = useTranslation("global");
  const item = (mark: ReactNode, text: string) => (
    <span className="inline-flex items-center gap-2">
      {mark}
      {text}
    </span>
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-500 md:justify-start">
      {item(
        <span className="h-3.5 w-3.5 rounded-full bg-[#2A579E] ring-1 ring-[#2A579E] ring-offset-1" />,
        t("livePage.eagle"),
      )}
      {item(
        <span className="h-3.5 w-3.5 rounded-full border-2 border-[#2A579E]" />,
        t("livePage.birdie"),
      )}
      {item(
        <span className="h-3.5 w-3.5 rounded-sm border-2 border-neutral-800" />,
        t("livePage.bogey"),
      )}
      {item(
        <span className="h-3.5 w-3.5 rounded-sm bg-neutral-900 ring-1 ring-neutral-900 ring-offset-1" />,
        t("livePage.doubleBogey"),
      )}
    </div>
  );
};

// Estadística de la vuelta: etiqueta, número y detalle (barra o texto),
// siempre en el mismo orden para que queden alineadas
const StatTile = ({
  label,
  value,
  of,
  detail,
}: {
  label: string;
  value: number;
  of?: number;
  detail?: string;
}) => (
  <div className="flex flex-col bg-white p-5">
    {/* Dos líneas reservadas en pantallas chicas: los números quedan parejos */}
    <span className="min-h-[2.6em] text-[10px] font-bold uppercase leading-[1.3] tracking-[0.25em] text-neutral-500 lg:min-h-0">
      {label}
    </span>
    <span className="mt-2 font-title text-3xl font-extrabold leading-none text-neutral-900">
      {value}
      {of !== undefined && (
        <span className="text-lg font-semibold text-neutral-400">/{of}</span>
      )}
    </span>
    <div className="mt-auto pt-3">
      {of !== undefined ? (
        <div className="h-1.5 rounded-full bg-[#E9EEF6]">
          <div
            className="h-full rounded-full bg-[#2A579E]"
            style={{ width: `${of ? Math.round((value / of) * 100) : 0}%` }}
          />
        </div>
      ) : (
        <p className="text-xs text-neutral-500">{detail}</p>
      )}
    </div>
  </div>
);

const RoundStatsGrid = ({ card }: { card: RoundCard }) => {
  const { t, i18n } = useTranslation("global");
  const s = card.stats;
  if (!s) return null;
  const perHole =
    s.putts !== null && card.holesPlayed
      ? (s.putts / card.holesPlayed).toLocaleString(i18n.language, {
          maximumFractionDigits: 2,
        })
      : null;
  return (
    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E6E6E6] bg-[#E6E6E6] lg:grid-cols-4">
      {s.fairways ? (
        <StatTile
          label={t("livePage.stats.fairways")}
          value={s.fairways.hit}
          of={s.fairways.total}
        />
      ) : (
        <StatTile label={t("livePage.stats.fairways")} value={0} detail="–" />
      )}
      {s.gir ? (
        <StatTile
          label={t("livePage.stats.gir")}
          value={s.gir.hit}
          of={s.gir.total}
        />
      ) : (
        <StatTile label={t("livePage.stats.gir")} value={0} detail="–" />
      )}
      <StatTile
        label={t("livePage.stats.putts")}
        value={s.putts ?? 0}
        detail={perHole ? t("livePage.stats.perHole", { value: perHole }) : "–"}
      />
      <StatTile
        label={t("livePage.stats.birdiesTitle")}
        value={s.birdies}
        detail={t("livePage.stats.parsBogeys", {
          pars: s.pars,
          bogeys: s.bogeys,
        })}
      />
    </div>
  );
};

const ScorecardSection = ({ snap }: { snap: LiveSnapshot }) => {
  const { t } = useTranslation("global");
  // Vuelta elegida a mano, recordando en qué vuelta se eligió: cuando empieza
  // una vuelta nueva la elección se descarta y se muestra la actual
  const [choice, setChoice] = useState<{ id: number; during: number } | null>(
    null,
  );
  const selected =
    choice && choice.during === snap.round ? choice.id : snap.round;
  const setSelected = (id: number) => setChoice({ id, during: snap.round });

  const card = snap.cards.find((c) => c.id === selected) ?? snap.cards.at(-1);
  if (!card) return null;
  const isCurrentRound = card.id === snap.round;
  const currentHole = isCurrentRound ? snap.currentHole : null;

  return (
    <section className="py-12 md:py-20">
      <Container>
        <SectionTitle
          title={t("livePage.byHole")}
          subtitle={
            card.startTee !== 1
              ? `${t("livePage.roundOf", { round: card.id, total: snap.totalRounds })} · ${t("livePage.startTee", { tee: card.startTee })}`
              : t("livePage.roundOf", {
                  round: card.id,
                  total: snap.totalRounds,
                })
          }
        />

        {snap.cards.length > 1 && (
          <div
            role="tablist"
            className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start"
          >
            {snap.cards.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={c.id === card.id}
                onClick={() => setSelected(c.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  c.id === card.id
                    ? "bg-[#2A579E] text-white"
                    : "border border-[#E6E6E6] text-neutral-700 hover:bg-[#F8F8F8]"
                }`}
              >
                {t("livePage.round")} {c.id}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Los nueve que jugó primero van arriba (sale por el 1 o por el 10) */}
          {(card.startTee >= 10 ? ["back", "front"] : ["front", "back"]).map(
            (nine) =>
              nine === "front" ? (
                <NineTable
                  key={nine}
                  holes={card.holes.slice(0, 9)}
                  label={t("livePage.frontNine")}
                  currentHole={currentHole}
                />
              ) : (
                card.holes.length > 9 && (
                  <NineTable
                    key={nine}
                    holes={card.holes.slice(9, 18)}
                    label={t("livePage.backNine")}
                    currentHole={currentHole}
                  />
                )
              ),
          )}
          <Legend />
        </div>

        <RoundStatsGrid card={card} />
      </Container>
    </section>
  );
};

/* ---------- Vueltas ---------- */

const RoundsSection = ({ snap }: { snap: LiveSnapshot }) => {
  const { t } = useTranslation("global");
  return (
    <section className="bg-[#F8FAFD] py-12 md:py-20">
      <Container>
        <SectionTitle title={t("livePage.roundsHistory")} />
        <ul className="overflow-hidden rounded-xl border border-[#E6E6E6] bg-white">
          {snap.rounds.map((round) => {
            const current = round.id === snap.round;
            return (
              <li
                key={round.id}
                className="flex items-center justify-between gap-4 border-t border-[#E6E6E6] px-4 py-4 first:border-t-0 sm:px-5"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                      current
                        ? "bg-[#2A579E] text-white"
                        : "bg-[#F1F4F9] text-neutral-500"
                    }`}
                  >
                    {t("livePage.roundAbbr")}
                    {round.id}
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {round.state === "in-progress"
                        ? t("livePage.status.inProgress")
                        : round.state === "finished"
                          ? t("livePage.status.finished")
                          : t("livePage.status.upcoming")}
                    </p>
                    {round.date && (
                      <p className="text-xs text-neutral-500">{round.date}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[3.5rem_3.5rem] gap-4 text-right sm:grid-cols-[4.5rem_4.5rem]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {t("livePage.strokes")}
                    </p>
                    <p className="font-title text-lg font-extrabold text-neutral-900">
                      {round.strokes ?? "–"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {t("livePage.vsPar")}
                    </p>
                    <p className="font-title text-lg font-extrabold text-neutral-900">
                      {round.state === "upcoming"
                        ? "–"
                        : formatToPar(round.toPar)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
};

/* ---------- Sin datos ---------- */

const NoLive = ({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) => {
  const { t } = useTranslation("global");
  const live = useLive();
  const failed = !!live.error && !live.tournament;
  const tournamentName = live.tournament?.name;

  return (
    <main className="w-full bg-white pt-[68px] md:pt-[84px]">
      <section className="relative overflow-hidden bg-linear-to-br from-[#173a70] via-[#2A579E] to-[#1f4a8f] py-12 text-white md:py-20">
        <Dots />
        <Container>
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-100/80">
                {t("livePage.eyebrow")}
              </p>
              <h1 className="mt-3 font-signature text-[clamp(2.5rem,12vw,3.5rem)] leading-tight md:text-7xl">
                {t("livePage.title")}
              </h1>
              <p className="mt-4 font-title text-xl font-bold md:text-2xl">
                {failed
                  ? t("livePage.noLive.errorTitle")
                  : t("livePage.noLive.title")}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-blue-100/80 md:mx-0">
                {failed
                  ? t("livePage.noLive.errorSubtitle")
                  : live.notInField
                    ? t("livePage.noLive.notInField")
                    : t("livePage.noLive.subtitle")}
              </p>
              {!failed && (
                <p className="mt-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm">
                  {tournamentName
                    ? t("livePage.noLive.tournamentDetected", {
                        name: tournamentName,
                      })
                    : t("livePage.noLive.noTournament")}
                </p>
              )}
            </div>
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-2 border-white/80 shadow-xl md:h-52 md:w-52">
              <img
                src={nuriImg}
                alt="Nuria Iturrioz"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="rounded-full bg-[#1d3f78] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#2A579E] disabled:opacity-60"
            >
              {t("livePage.refreshData")}
            </button>
            <Link
              to="/stats"
              className="rounded-full border border-[#E6E6E6] px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-[#F8F8F8]"
            >
              {t("livePage.noLive.ctaStats")}
            </Link>
            <Link
              to="/news"
              className="rounded-full border border-[#E6E6E6] px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-[#F8F8F8]"
            >
              {t("livePage.noLive.ctaNews")}
            </Link>
            <Link
              to="/"
              className="rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-blue-50"
              style={{ color: BLUE }}
            >
              {t("livePage.noLive.ctaHome")}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default LivePage;
