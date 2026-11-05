import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/aramco-china-2026-R1.json";
import { parseLetData, parseToPar, playOrderFrom } from "./parse";

// Copia de la respuesta real con Nuria modificada para simular otros momentos
const withNuria = (patch: Record<string, string>, top: Record<string, string> = {}) => {
  const data = structuredClone(fixture) as typeof fixture & Record<string, unknown>;
  Object.assign(data, top);
  const entries = data.scores.scores_entry as Record<string, string>[];
  const nuria = entries.find((e) => e.member_no === "200899")!;
  Object.assign(nuria, patch);
  return data;
};

describe("parseLetData con la respuesta real (Aramco China, vuelta 1)", () => {
  const snap = parseLetData(fixture, { fileRound: 1, expectedRounds: 4 })!;

  it("encuentra a Nuria y el torneo", () => {
    expect(snap).not.toBeNull();
    expect(snap.tournamentName).toBe("Aramco China Championship");
    expect(snap.tournamentCode).toBe("2019");
    expect(snap.dates).toBe("5th - 8th November 2026");
  });

  it("vuelta 1 terminada: 74 golpes, +1, sin hoyo actual", () => {
    expect(snap.round).toBe(1);
    expect(snap.state).toBe("round-finished");
    expect(snap.holesPlayed).toBe(18);
    expect(snap.currentHole).toBeNull();
    expect(snap.totalToPar).toBe(1);
    expect(snap.roundToPar).toBe(1);
    expect(snap.rounds[0]).toMatchObject({ id: 1, strokes: 74, state: "finished" });
  });

  it("status 'C' no se interpreta como corte", () => {
    expect(snap.state).not.toBe("out");
  });

  it("4 vueltas aunque el archivo solo traiga fechas de la 1 y la 2", () => {
    expect(snap.totalRounds).toBe(4);
    expect(snap.rounds.map((r) => r.id)).toEqual([1, 2, 3, 4]);
  });

  it("salió por el hoyo 10 y juega 10..18, 1..9", () => {
    expect(snap.startTee).toBe(10);
    expect(snap.playOrder.slice(0, 3)).toEqual([10, 11, 12]);
    expect(snap.playOrder[9]).toBe(1);
  });

  it("marca el empate en la posición", () => {
    expect(snap.position).toEqual({ label: "T75", pos: 75 });
  });

  it("par del campo y hora de actualización del LET", () => {
    expect(snap.coursePar).toBe(73);
    expect(snap.updatedAt?.toISOString()).toBe("2026-11-05T13:26:22.000Z");
  });
});

describe("parseLetData en otros momentos del torneo", () => {
  it("en pleno recorrido saliendo por el 10: hoyo actual = siguiente en su orden", () => {
    const scores = Array(18).fill("");
    scores[9] = "4"; // 10
    scores[10] = "5"; // 11
    scores[11] = "3"; // 12
    const snap = parseLetData(
      withNuria(
        {
          hole_scores_R2: scores.join(",") + ",",
          tee_R2: "10",
          strokes_R2: ",,",
          vspar_R2: "-1",
          vspar: "E",
          status_R2: "",
        },
        { last_round_with_scores: "2" },
      ),
    )!;
    expect(snap.round).toBe(2);
    expect(snap.state).toBe("on-course");
    expect(snap.holesPlayed).toBe(3);
    expect(snap.currentHole).toBe(13);
    expect(snap.totalToPar).toBe(0);
    expect(snap.rounds[1].state).toBe("in-progress");
  });

  it("usa el hoyo y los golpes en curso cuando el LET los informa", () => {
    const snap = parseLetData(
      withNuria(
        { hole_scores_R2: ",,,,,,,,,,,,,,,,,,", tee_R2: "1", strokes_R2: "1,2," },
        { last_round_with_scores: "2" },
      ),
    )!;
    expect(snap.state).toBe("on-course");
    expect(snap.currentHole).toBe(1);
    expect(snap.currentHoleStrokes).toBe(2);
  });

  it("vuelta sorteada sin jugar: no salió, con hora y hoyo de salida", () => {
    const snap = parseLetData(
      withNuria({ time_R2: "7:40", tee_R2: "1", hole_scores_R2: "" }),
      { fileRound: 2 },
    )!;
    expect(snap.round).toBe(2);
    expect(snap.state).toBe("not-started");
    expect(snap.teeTime).toBe("7:40");
    expect(snap.startTee).toBe(1);
  });

  it("sin vspar todavía: null, nunca NaN", () => {
    const snap = parseLetData(withNuria({ vspar: "", vspar_R1: "" }))!;
    expect(snap.totalToPar).toBeNull();
    expect(snap.roundToPar).toBeNull();
  });

  it("retirada: estado 'out' con la etiqueta", () => {
    const snap = parseLetData(withNuria({ pos: "WD" }))!;
    expect(snap.state).toBe("out");
    expect(snap.outLabel).toBe("WD");
    expect(snap.position).toEqual({ label: "WD", pos: null });
  });

  it("última vuelta completa: torneo terminado", () => {
    const snap = parseLetData(withNuria({}, { last_round_with_scores: "4" }), {
      expectedRounds: 4,
    });
    // En la vuelta 4 no hay tarjeta en este archivo: no salió todavía
    expect(snap?.state).toBe("not-started");
    const done = parseLetData(
      withNuria({ hole_scores_R4: fixtureScores() }, { last_round_with_scores: "4" }),
      { expectedRounds: 4 },
    );
    expect(done?.state).toBe("tournament-finished");
  });

  it("sin Nuria o con datos vacíos devuelve null", () => {
    expect(parseLetData({})).toBeNull();
    expect(parseLetData(null)).toBeNull();
    const data = structuredClone(fixture);
    data.scores.scores_entry = data.scores.scores_entry.filter(
      (e) => e.member_no !== "200899",
    );
    expect(parseLetData(data)).toBeNull();
  });
});

describe("utilidades", () => {
  it("parseToPar", () => {
    expect(parseToPar("Par")).toBe(0);
    expect(parseToPar("E")).toBe(0);
    expect(parseToPar("+3")).toBe(3);
    expect(parseToPar("-2")).toBe(-2);
    expect(parseToPar("")).toBeNull();
    expect(parseToPar("abc")).toBeNull();
  });

  it("playOrderFrom", () => {
    expect(playOrderFrom(1).slice(0, 2)).toEqual([1, 2]);
    expect(playOrderFrom(10)).toHaveLength(18);
    expect(playOrderFrom(99)[0]).toBe(1);
  });
});

function fixtureScores() {
  const nuria = fixture.scores.scores_entry.find((e) => e.member_no === "200899")!;
  return nuria.hole_scores_R1;
}
