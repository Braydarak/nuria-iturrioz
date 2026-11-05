import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "./__fixtures__/aramco-china-2026-R1.json";
import {
  fetchLatestRound,
  findActiveTournament,
  letRoundUrl,
  roundsOf,
  seasonOf,
} from "./letApi";
import type { Tournament } from "../utils/tournamentDate";

const china: Tournament = {
  name: "Aramco China Championship",
  date: "05/11/26",
  date_end: "08/11/26",
  confirmed: true,
  status: "Entered",
  code: "2019",
  // Valor real cargado en la base, que hoy no funciona
  scores_param: "ESC",
};

describe("findActiveTournament", () => {
  it("detecta el torneo de Asia la noche anterior (hora de España)", () => {
    // 4 de noviembre, 23:30: en China ya se juega la vuelta 1
    expect(findActiveTournament([china], new Date(2026, 10, 4, 23, 30))).toBe(china);
  });

  it("sigue activo el día siguiente al último", () => {
    expect(findActiveTournament([china], new Date(2026, 10, 9, 12))).toBe(china);
  });

  it("fuera de la ventana no hay torneo (nada de torneos viejos de respaldo)", () => {
    expect(findActiveTournament([china], new Date(2026, 10, 20))).toBeNull();
    expect(findActiveTournament([], new Date())).toBeNull();
  });

  it("si se solapan, prefiere el confirmado", () => {
    const other: Tournament = { ...china, code: "9999", confirmed: false, status: null };
    expect(findActiveTournament([other, china], new Date(2026, 10, 6))).toBe(china);
  });
});

describe("temporada y vueltas", () => {
  it("la temporada sale de la fecha del torneo", () => {
    expect(seasonOf(china)).toBe(2026);
    expect(seasonOf({ ...china, date: "15/01/27" })).toBe(2027);
    expect(letRoundUrl(2027, "2019", 1, "SRC")).toContain("/2027/2027-2019-");
  });

  it("cantidad de vueltas según los días", () => {
    expect(roundsOf(china)).toBe(4);
    expect(roundsOf({ ...china, date_end: "07/11/26" })).toBe(3);
  });
});

describe("fetchLatestRound", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  const json = (body: unknown) =>
    Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

  it("si ESC devuelve {} prueba SRC y lo recuerda", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes("P*1SRC01")) return json(fixture);
      return json({});
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchLatestRound(china);
    expect(result?.param).toBe("SRC");
    expect(result?.round).toBe(1);
    expect(localStorage.getItem("let-param:2026-2019")).toBe("SRC");

    // La próxima vez empieza directamente por SRC
    fetchMock.mockClear();
    await fetchLatestRound(china);
    expect(fetchMock.mock.calls[0][0]).toContain("SRC");
  });

  it("elige la vuelta más alta con datos", async () => {
    const r2 = { ...fixture, last_round_with_scores: "2" };
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        url.includes("P*2SRC02")
          ? json(r2)
          : url.includes("P*1SRC01")
            ? json(fixture)
            : json({}),
      ),
    );
    const result = await fetchLatestRound(china);
    expect(result?.round).toBe(2);
  });

  it("descarta datos de otro torneo", async () => {
    vi.stubGlobal("fetch", vi.fn(() => json({ ...fixture, code: "2016" })));
    expect(await fetchLatestRound(china)).toBeNull();
  });

  it("sin resultados todavía devuelve null; sin red lanza error", async () => {
    vi.stubGlobal("fetch", vi.fn(() => json({})));
    expect(await fetchLatestRound(china)).toBeNull();

    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("offline"))));
    await expect(fetchLatestRound(china)).rejects.toThrow();
  });
});
