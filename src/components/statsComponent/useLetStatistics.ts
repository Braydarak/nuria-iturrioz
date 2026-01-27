export type LetStatistics = {
  tournamentWins: number | null
  tournamentTopTenFinishes: number | null
  totalNumberOfBirdies: number | null
  drivingDistance: number | null
  biggestComebackMargin: string | number | null
}

export type StatEntry = {
  description: string
  value: number | string | null
  code?: string
  tour?: string
  played?: number | null
  tournaments?: number | null
}

const PROFILE_URL = 'https://api.euro.ocs-software.com/let/cache/let/profiles/200899?randomadd=1769433522174'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function normalizeValue(value: unknown): string | number | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '' || trimmed.toLowerCase() === 'n/a') return null
    const cleaned = trimmed.replace(/[^0-9.-]/g, '')
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : trimmed
  }
  return null
}

function getFromStatisticArray(statsArr: unknown): Partial<LetStatistics> | null {
  if (!Array.isArray(statsArr)) return null
  const result: Partial<LetStatistics> = {}
  const want = new Map<string, (val: string | number | null) => void>([
    ['tournament wins', (val) => { result.tournamentWins = typeof val === 'number' ? val : null }],
    ['tournament top ten finishes', (val) => { result.tournamentTopTenFinishes = typeof val === 'number' ? val : null }],
    ['total number of birdies', (val) => { result.totalNumberOfBirdies = typeof val === 'number' ? val : null }],
    ['driving distance', (val) => { result.drivingDistance = typeof val === 'number' ? val : null }],
    ['biggest comeback margin', (val) => { result.biggestComebackMargin = val }],
  ])

  for (const item of statsArr) {
    if (!isRecord(item)) continue
    const tour = typeof item['TOUR'] === 'string' ? item['TOUR'] : undefined
    if (tour && tour !== 'LET') continue

    const desc = typeof item['DESCRIPTION'] === 'string' ? item['DESCRIPTION'] : ''
    const code = typeof item['CODE'] === 'string' ? item['CODE'] : undefined
    const key = desc.toLowerCase()
    const setter = want.get(key)
    if (setter) {
      const normalized = normalizeValue(item['VALUE'])
      setter(normalized)
    }
    // Fallback por código: S155 corresponde a Driving Distance en la API
    if (code === 'S155') {
      const normalized = normalizeValue(item['VALUE'])
      result.drivingDistance = typeof normalized === 'number' ? normalized : result.drivingDistance ?? null
    }
  }
  return Object.keys(result).length ? result : null
}

function getStatisticEntriesFromArray(statsArr: unknown): StatEntry[] {
  if (!Array.isArray(statsArr)) return []
  const entries: StatEntry[] = []
  for (const item of statsArr) {
    if (!isRecord(item)) continue
    const tour = typeof item['TOUR'] === 'string' ? item['TOUR'] : undefined
    if (tour && tour !== 'LET') continue
    const description = typeof item['DESCRIPTION'] === 'string' ? item['DESCRIPTION'] : ''
    const value = normalizeValue(item['VALUE'])
    const code = typeof item['CODE'] === 'string' ? item['CODE'] : undefined
    const playedRaw = item['PLAYED']
    const played = typeof playedRaw === 'number' ? playedRaw : typeof playedRaw === 'string' ? Number(playedRaw) : null
    const tournamentsRaw = (item as Record<string, unknown>)['TOURNAMENTS']
    const tournaments = typeof tournamentsRaw === 'number' ? tournamentsRaw : typeof tournamentsRaw === 'string' ? Number(tournamentsRaw) : null

    if (description && (value !== null || played !== null || tournaments !== null)) {
      entries.push({ description, value, code, tour, played, tournaments })
    }
  }
  return entries
}

function getLetStatistics(obj: unknown): LetStatistics | null {
  if (!isRecord(obj)) return null

  const statistics = (obj as Record<string, unknown>)['STATISTICS']
    ?? (obj as Record<string, unknown>)['Statistics']
    ?? (obj as Record<string, unknown>)['statistics']

  if (Array.isArray(statistics)) {
    const partial = getFromStatisticArray(statistics)
    if (partial) {
      return {
        tournamentWins: partial.tournamentWins ?? null,
        tournamentTopTenFinishes: partial.tournamentTopTenFinishes ?? null,
        totalNumberOfBirdies: partial.totalNumberOfBirdies ?? null,
        drivingDistance: partial.drivingDistance ?? null,
        biggestComebackMargin: partial.biggestComebackMargin ?? null,
      }
    }
  }

  if (isRecord(statistics)) {
    const inner = (statistics as Record<string, unknown>)['STATISTIC']
      ?? (statistics as Record<string, unknown>)['Statistic']
      ?? (statistics as Record<string, unknown>)['statistic']

    const statsArr = Array.isArray(inner) ? inner : (isRecord(inner) ? [inner] : undefined)
    if (statsArr) {
      const partial = getFromStatisticArray(statsArr)
      if (partial) {
        return {
          tournamentWins: partial.tournamentWins ?? null,
          tournamentTopTenFinishes: partial.tournamentTopTenFinishes ?? null,
          totalNumberOfBirdies: partial.totalNumberOfBirdies ?? null,
          drivingDistance: partial.drivingDistance ?? null,
          biggestComebackMargin: partial.biggestComebackMargin ?? null,
        }
      }
    }
  }

  const wins = normalizeValue((obj as Record<string, unknown>)["Tournament Wins"]) as number | null
  const topTen = normalizeValue((obj as Record<string, unknown>)["Tournament Top Ten Finishes"]) as number | null
  const birdies = normalizeValue((obj as Record<string, unknown>)["Total Number of Birdies"]) as number | null
  const driving = normalizeValue((obj as Record<string, unknown>)["Driving Distance"]) as number | null
  const comeback = normalizeValue((obj as Record<string, unknown>)["Biggest Comeback Margin"]) as string | number | null
  if (wins !== null || topTen !== null || birdies !== null || driving !== null || comeback !== null) {
    return {
      tournamentWins: typeof wins === 'number' ? wins : null,
      tournamentTopTenFinishes: typeof topTen === 'number' ? topTen : null,
      totalNumberOfBirdies: typeof birdies === 'number' ? birdies : null,
      drivingDistance: typeof driving === 'number' ? driving : null,
      biggestComebackMargin: comeback ?? null,
    }
  }
  return null
}

function getAllStatisticEntries(obj: unknown): StatEntry[] {
  if (!isRecord(obj)) return []
  const statistics = (obj as Record<string, unknown>)['STATISTICS']
    ?? (obj as Record<string, unknown>)['Statistics']
    ?? (obj as Record<string, unknown>)['statistics']

  if (Array.isArray(statistics)) return getStatisticEntriesFromArray(statistics)

  if (isRecord(statistics)) {
    const inner = (statistics as Record<string, unknown>)['STATISTIC']
      ?? (statistics as Record<string, unknown>)['Statistic']
      ?? (statistics as Record<string, unknown>)['statistic']
    const statsArr = Array.isArray(inner) ? inner : (isRecord(inner) ? [inner] : undefined)
    if (statsArr) return getStatisticEntriesFromArray(statsArr)
  }

  const entries: StatEntry[] = []
  const queue: unknown[] = [obj]
  while (queue.length) {
    const current = queue.shift()
    if (Array.isArray(current)) {
      entries.push(...getStatisticEntriesFromArray(current))
      for (const it of current) queue.push(it)
      continue
    }
    if (isRecord(current)) {
      for (const key of Object.keys(current)) {
        const val = (current as Record<string, unknown>)[key]
        if (isRecord(val) || Array.isArray(val)) queue.push(val)
      }
    }
  }
  return entries
}

import { useEffect, useMemo, useState } from 'react'

function getMemberAge(obj: unknown): number | null {
  function num(v: unknown): number | null {
    const n = normalizeValue(v)
    if (typeof n === 'number' && Number.isFinite(n)) return Math.round(n)
    if (typeof n === 'string') {
      const parsed = Number(String(n).replace(/[^0-9.-]/g, ''))
      return Number.isFinite(parsed) ? Math.round(parsed) : null
    }
    return null
  }
  const preferredKeys = ['MEMBER', 'Member', 'member']
  const queue: unknown[] = []
  for (const k of preferredKeys) {
    const v = isRecord(obj) ? (obj as Record<string, unknown>)[k] : undefined
    if (v) queue.push(v)
  }
  if (queue.length === 0) queue.push(obj)
  const visited = new Set<unknown>()
  while (queue.length) {
    const node = queue.shift()
    if (!node || visited.has(node)) continue
    visited.add(node)
    if (isRecord(node)) {
      for (const key of ['AGE', 'Age', 'age']) {
        if (key in node) {
          const val = num((node as Record<string, unknown>)[key])
          if (val !== null) return val
        }
      }
      for (const v of Object.values(node)) {
        if (isRecord(v) || Array.isArray(v)) queue.push(v)
      }
    } else if (Array.isArray(node)) {
      for (const v of node) {
        if (isRecord(v) || Array.isArray(v)) queue.push(v)
      }
    }
  }
  return null
}

export function useLetStatistics() {
  const [data, setData] = useState<LetStatistics | null>(null)
  const [entries, setEntries] = useState<StatEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memberAge, setMemberAge] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(PROFILE_URL, { headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as unknown
        const extracted = getLetStatistics(json)
        const list = getAllStatisticEntries(json)
        if (!extracted && list.length === 0) throw new Error('No se encontró STATISTICS del TOUR LET')
        const ageVal = getMemberAge(json)

        // Si falta Driving Distance, intentar obtenerla desde las entries por código S155
        let finalData = extracted
        if (!finalData || finalData.drivingDistance === null) {
          const dd = list.find((e) => e.code === 'S155' && (e.tour === 'LET' || !e.tour))
          const numeric = dd ? (typeof dd.value === 'number' ? dd.value : (typeof dd.value === 'string' ? Number(String(dd.value).replace(/[^0-9.-]/g, '')) : null)) : null
          if (numeric !== null && (!finalData || finalData.drivingDistance === null)) {
            finalData = {
              tournamentWins: finalData?.tournamentWins ?? null,
              tournamentTopTenFinishes: finalData?.tournamentTopTenFinishes ?? null,
              totalNumberOfBirdies: finalData?.totalNumberOfBirdies ?? null,
              drivingDistance: numeric,
              biggestComebackMargin: finalData?.biggestComebackMargin ?? null,
            }
          }
        }

        if (!cancelled) {
          setData(finalData)
          setEntries(list)
          setMemberAge(ageVal)
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        if (!cancelled) setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const hasData = useMemo(() => (
    (data && (
      data.tournamentWins !== null ||
      data.tournamentTopTenFinishes !== null ||
      data.totalNumberOfBirdies !== null ||
      data.drivingDistance !== null ||
      data.biggestComebackMargin !== null
    )) || entries.length > 0
  ), [data, entries])

  return { data, entries, loading, error, hasData, memberAge }
}