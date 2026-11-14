/**
 * Noite X — fonte única de verdade temporal (Jana / Miro / Elisa / Sandra).
 *
 * Não inventa horários. Quando o canon não fixa um número, usa
 * `UNSPECIFIED` (intervalo/unknown) em vez de fabricar minutos.
 *
 * Âncoras canônicas já fixadas no Puzzle 04:
 * - Relógio do Vértice no evento musical: 01:16:00
 * - Horário real correspondente: 01:23:30 (+450 s)
 * - Sandra no primeiro avistamento: ~01:16 real
 */

export type NoiteXTimePrecision = 'exact' | 'approx' | 'interval' | 'UNSPECIFIED'

export type NoiteXClock = {
  /** Relógio da casa (Vértice). */
  vertice: string | null
  /** Tempo civil / telefone / real. */
  real: string | null
  precision: NoiteXTimePrecision
  /** Quando precision = interval, extremos conhecidos (se houver). */
  realWindow?: { from: string | null; to: string | null }
  notes?: string
}

export type NoiteXEventId =
  | 'jana_at_vertice'
  | 'jana_leaves_first'
  | 'miro_follows_jana'
  | 'jana_notices_tail'
  | 'jana_returns_vertice'
  | 'jana_leaves_jacket_bag_with_elisa'
  | 'jana_leaves_alternate_route'
  | 'elisa_stays_for_music'
  | 'musical_reference_event'
  | 'elisa_leaves'
  | 'miro_follows_elisa_as_jana'
  | 'sandra_observes_first_pursuit'
  | 'sandra_leaves_for_help'
  | 'sandra_returns'
  | 'sandra_sees_unidentified_from_fall_area'
  | 'elisa_death_fall'

export type NoiteXEvent = {
  id: NoiteXEventId
  label: string
  actors: Array<'jana' | 'miro' | 'elisa' | 'sandra' | 'nico' | 'crowd'>
  time: NoiteXClock
  sources: string[]
}

/** Offset canônico Vértice → real (Puzzle 04). */
export const NOITE_X_VERTICE_TO_REAL_OFFSET_SEC = 450

export const NOITE_X_VERTICE_DJ_CLOCK = '01:16:00'
export const NOITE_X_REAL_DJ_CLOCK = '01:23:30'
/** Sandra no primeiro avistamento — rótulo canônico, não um instante absoluto. */
export const NOITE_X_SANDRA_FIRST_SIGHTING_REAL = '~01:16'

export const NOITE_X_EVENTS: NoiteXEvent[] = [
  {
    id: 'jana_at_vertice',
    label: 'Jana no Vértice',
    actors: ['jana'],
    time: {
      vertice: null,
      real: null,
      precision: 'UNSPECIFIED',
      notes: 'Presente na casa antes da saída; horário exato não fixado no canon numérico.',
    },
    sources: ['janaInterview', 'nicoInterview', 'miroInterview'],
  },
  {
    id: 'jana_leaves_first',
    label: 'Jana sai (primeira saída)',
    actors: ['jana'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['janaInterview', 'miroInterview'],
  },
  {
    id: 'miro_follows_jana',
    label: 'Miro segue Jana',
    actors: ['miro', 'jana'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['miroInterview', 'miroThird'],
  },
  {
    id: 'jana_notices_tail',
    label: 'Jana percebe que está sendo seguida',
    actors: ['jana', 'miro'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['miroThird', 'janaFollowup'],
  },
  {
    id: 'jana_returns_vertice',
    label: 'Jana volta ao Vértice',
    actors: ['jana'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['janaInterview', 'janaFollowup', 'nicoFollowup'],
  },
  {
    id: 'jana_leaves_jacket_bag_with_elisa',
    label: 'Jana deixa jaqueta/bolsa com Elisa',
    actors: ['jana', 'elisa'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['janaInterview', 'janaFollowup', 'nicoFollowup'],
  },
  {
    id: 'jana_leaves_alternate_route',
    label: 'Jana sai por outra rota',
    actors: ['jana'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['janaFollowup', 'miroInterview'],
  },
  {
    id: 'elisa_stays_for_music',
    label: 'Elisa permanece para ouvir a música',
    actors: ['elisa'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['nicoInterview', 'janaInterview'],
  },
  {
    id: 'musical_reference_event',
    label: 'Evento musical de referência (Levels / transição)',
    actors: ['nico', 'crowd', 'elisa'],
    time: {
      vertice: NOITE_X_VERTICE_DJ_CLOCK,
      real: NOITE_X_REAL_DJ_CLOCK,
      precision: 'exact',
      notes: 'Âncora P04: set log Vertice 01:16:00 ≡ real 01:23:30 (+450s).',
    },
    sources: ['puzzle04Janus', 'nico_recording_booth'],
  },
  {
    id: 'elisa_leaves',
    label: 'Elisa sai',
    actors: ['elisa'],
    time: {
      vertice: NOITE_X_VERTICE_DJ_CLOCK,
      real: NOITE_X_REAL_DJ_CLOCK,
      precision: 'approx',
      notes:
        'Saída de Elisa ancorada no evento musical corrigido (real 01:23:30). Não conflacionar com Sandra ~01:16 real.',
    },
    sources: ['puzzle04Janus', 'sandra_first_sighting_not_elisa'],
  },
  {
    id: 'miro_follows_elisa_as_jana',
    label: 'Miro segue Elisa acreditando ser Jana',
    actors: ['miro', 'elisa'],
    time: {
      vertice: null,
      real: null,
      precision: 'interval',
      realWindow: { from: NOITE_X_REAL_DJ_CLOCK, to: null },
      notes: 'Após a saída de Elisa com a jaqueta; instante exato UNSPECIFIED.',
    },
    sources: ['miroInterview', 'miroThird'],
  },
  {
    id: 'sandra_observes_first_pursuit',
    label: 'Sandra observa a primeira perseguição',
    actors: ['sandra', 'miro', 'jana'],
    time: {
      vertice: null,
      real: NOITE_X_SANDRA_FIRST_SIGHTING_REAL,
      precision: 'approx',
      notes:
        'Janela ~01:16 real — mulher com jaqueta clara + bolsa, seguida. Não é a saída de Elisa às 01:23:30.',
    },
    sources: ['sandraInterview', 'puzzle04Janus'],
  },
  {
    id: 'sandra_leaves_for_help',
    label: 'Sandra sai para buscar ajuda',
    actors: ['sandra'],
    time: {
      vertice: null,
      real: null,
      precision: 'interval',
      realWindow: { from: NOITE_X_SANDRA_FIRST_SIGHTING_REAL, to: null },
      notes:
        'Duração do afastamento não numerada no canon; deve caber o retorno de Jana e a posterior saída de Elisa.',
    },
    sources: ['sandraInterview'],
  },
  {
    id: 'sandra_returns',
    label: 'Sandra retorna',
    actors: ['sandra'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['sandraInterview'],
  },
  {
    id: 'sandra_sees_unidentified_from_fall_area',
    label: 'Sandra vê alguém vindo da região da queda (sem identificar)',
    actors: ['sandra'],
    time: { vertice: null, real: null, precision: 'UNSPECIFIED' },
    sources: ['sandraInterview'],
  },
  {
    id: 'elisa_death_fall',
    label: 'Morte/queda de Elisa',
    actors: ['elisa'],
    time: {
      vertice: null,
      real: null,
      precision: 'interval',
      realWindow: { from: NOITE_X_REAL_DJ_CLOCK, to: null },
      notes: 'Após saída de Elisa; horário civil exato UNSPECIFIED no dataset.',
    },
    sources: ['elisa_case_summary', 'miroInterview', 'sandraInterview'],
  },
]

/**
 * Ordem temporal canônica (não a ordem de inventário da lista do brief).
 * Sandra observa a 1ª perseguição (~01:16 real) antes da saída de Elisa (01:23:30).
 * Durante a busca por ajuda cabem o retorno de Jana e, depois, a saída de Elisa.
 */
export const NOITE_X_SEQUENCE: NoiteXEventId[] = [
  'jana_at_vertice',
  'jana_leaves_first',
  'miro_follows_jana',
  'jana_notices_tail',
  'sandra_observes_first_pursuit',
  'sandra_leaves_for_help',
  'jana_returns_vertice',
  'jana_leaves_jacket_bag_with_elisa',
  'jana_leaves_alternate_route',
  'elisa_stays_for_music',
  'musical_reference_event',
  'elisa_leaves',
  'miro_follows_elisa_as_jana',
  'sandra_returns',
  'sandra_sees_unidentified_from_fall_area',
  'elisa_death_fall',
]

export function getNoiteXEvent(id: NoiteXEventId): NoiteXEvent {
  const ev = NOITE_X_EVENTS.find((e) => e.id === id)
  if (!ev) throw new Error(`Noite X event missing: ${id}`)
  return ev
}

/** Converte HH:MM:SS (ou ~HH:MM) em segundos desde meia-noite; null se não parseável. */
export function parseClockToSec(clock: string | null | undefined): number | null {
  if (!clock) return null
  const cleaned = clock.replace(/^~/, '').trim()
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(cleaned)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  const s = Number(m[3] ?? 0)
  if ([h, min, s].some((n) => Number.isNaN(n))) return null
  return h * 3600 + min * 60 + s
}

export function verticeClockToRealSec(verticeClock: string): number | null {
  const v = parseClockToSec(verticeClock)
  if (v == null) return null
  return v + NOITE_X_VERTICE_TO_REAL_OFFSET_SEC
}
