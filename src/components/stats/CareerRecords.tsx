import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { parseRecordNote, type LetCareer } from "../../data/letCareer";

type RecordCard = {
  key: string;
  title: string;
  highlight: string;
  event?: string;
  detail?: string;
  date?: string;
  icon: ReactNode;
};

const icon = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  trophy: icon(
    "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3m10-4h3v1a3 3 0 0 1-3 3",
  ),
  target: icon(
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3.5v.01",
  ),
  spark: icon(
    "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  ),
  arrow: icon("M4 18 10 12l4 4 6-8M14 8h6v6"),
};

export default function CareerRecords({ career }: { career: LetCareer }) {
  const { t } = useTranslation();
  const cards: RecordCard[] = [];

  const detailOf = (round: number | null, hole: number | null) =>
    [
      round ? t("statsPage.records.round", { round }) : null,
      hole ? t("statsPage.records.hole", { hole }) : null,
    ]
      .filter(Boolean)
      .join(" · ");

  const wins = career.stats.get("B010");
  const winNote = wins && parseRecordNote(wins.notes);
  if (winNote) {
    cards.push({
      key: "lastWin",
      title: t("statsPage.records.lastWin"),
      highlight: winNote.event,
      date: winNote.date,
      icon: ICONS.trophy,
    });
  }

  const hio = career.stats.get("S125");
  const hioNote = hio && parseRecordNote(hio.notes);
  if (hio?.value && hioNote) {
    cards.push({
      key: "holeInOne",
      title: t("statsPage.records.holeInOne"),
      highlight: hioNote.event,
      date: hioNote.date,
      icon: ICONS.target,
    });
  }

  const albatross = career.stats.get("S108");
  const albatrossNote = albatross && parseRecordNote(albatross.notes);
  if (albatross?.value && albatrossNote) {
    cards.push({
      key: "albatross",
      title: t("statsPage.records.albatross"),
      highlight: albatrossNote.event,
      detail: detailOf(albatrossNote.round, albatrossNote.hole),
      date: albatrossNote.date,
      icon: ICONS.spark,
    });
  }

  const comeback = career.stats.get("B015");
  if (comeback?.value) {
    cards.push({
      key: "comeback",
      title: t("statsPage.records.comeback"),
      highlight: t("statsPage.records.strokes", { count: comeback.value }),
      detail: t("statsPage.records.comebackDetail"),
      icon: ICONS.arrow,
    });
  }

  if (!cards.length) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <li
          key={card.key}
          className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A579E]/10 text-[#2A579E]">
              {card.icon}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
              {card.title}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold leading-snug text-neutral-900 md:mt-4 md:text-xl">
            {card.highlight}
          </p>
          {card.event && <p className="mt-1 text-neutral-700">{card.event}</p>}
          {(card.detail || card.date) && (
            <p className="mt-2 text-sm text-neutral-500">
              {[card.detail, card.date].filter(Boolean).join(" · ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
