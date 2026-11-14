/**
 * Puzzle 03 — ANÉIS: fingerprint musical + arquivo histórico de sets.
 *
 * STATUS DE ASSET (não confundir com arquitetura de UI):
 * `P03_SECOND_TRACK_REQUIRED` — em `src/assets/audios/p3/` só existe UMA faixa musical
 * aprovada para o puzzle. DJ speech e crowd não contam como Faixa B.
 * Não inventar / sintetizar / stretch / remixar a mesma fonte como se fosse B.
 * Enquanto `sourceB` for null, o design NÃO está FIXED.
 */

/** Inventário explícito das fontes musicais do master P03. */
export const PUZZLE03_MUSIC_SOURCES = {
  status: 'PENDING_ASSET' as 'PENDING_ASSET' | 'FIXED',
  requirement: 'P03_SECOND_TRACK_REQUIRED' as const,
  /** Única faixa musical aprovada em p3/ (pré-mic no master atual). */
  sourceA: 'src/assets/audios/p3/Give-Me-Everything-Tonight-Hardtekk-The-Dark-Triad-Song.mp3',
  /**
   * Segunda faixa musical distinta — AUSENTE.
   * p3/ só tem: Give-Me-Everything…, DJ - Vértice.mp3, club-crowd.mp3.
   * Tracks de Capangas/Valter (p6/p7) NÃO são destino aprovado do P03.
   */
  sourceB: null as string | null,
  master: 'public/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3',
  djSpeech: 'src/assets/audios/p3/DJ - Vértice.mp3',
  crowd: 'src/assets/audios/p3/club-crowd.mp3',
} as const

/** Timing gerado por tools/audio/build_puzzle03.py (master atual = uma música). */
export const puzzle03Timing = {
  durationSec: 180,
  djStartSec: 72.0,
  djEndSec: 90.678,
  djDurationSec: 18.678,
  actualPreTempo: 126.1,
  actualPostTempo: 128.0,
  duckAmount: 0.42,
  preWindow: { startSec: 8.0, endSec: 68.0 },
  postWindow: { startSec: 96.0, endSec: 150.0 },
} as const

/** IDs técnicos provisórios (não nomes artísticos novos). */
export const PUZZLE03_TRACK_A_ID = 'TRACK_REF_A' as const
export const PUZZLE03_TRACK_B_ID = 'TRACK_REF_B' as const
export const PUZZLE03_CANONICAL_SESSION_ID = 'vtx-set-2019-11-08-nico' as const

export function puzzle03MusicSourcesAreDistinct(): boolean {
  const b = PUZZLE03_MUSIC_SOURCES.sourceB
  return Boolean(b) && PUZZLE03_MUSIC_SOURCES.sourceA !== b
}

/** Design só é FIXED quando existem duas fontes musicais distintas aprovadas. */
export function puzzle03DesignIsFixed(): boolean {
  return PUZZLE03_MUSIC_SOURCES.status === 'FIXED' && puzzle03MusicSourcesAreDistinct()
}

export type Puzzle03RegionId = 'A' | 'MIC' | 'B' | 'none'

export type FingerprintVector = {
  /** Sobreposição normalizada com janela pré-DJ (0–1). */
  preOverlap: number
  /** Sobreposição normalizada com janela pós-DJ (0–1). */
  postOverlap: number
  /** Sobreposição com janela do microfone (0–1). */
  micOverlap: number
  /** Tempo estimado da seleção (BPM), ou null se curto/instável. */
  tempoBpm: number | null
  durationSec: number
  centerSec: number
}

export type FingerprintCatalogEntry = {
  id: string
  /** Rótulo interno/técnico — sem inventar título artístico enquanto B faltar. */
  title: string
  versionLabel: string
  durationSec: number
  /** Path da fonte musical; null = placeholder até asset B. */
  sourceAssetPath: string | null
  /** Referência determinística (não é o áudio completo). */
  reference: {
    tempoBpm: number
    region: 'A' | 'B' | 'decoy'
    /** Assinatura binária estável para visual/score. */
    bins: number[]
  }
}

export type FingerprintHit = {
  trackId: string
  title: string
  versionLabel: string
  confidence: number
  strong: boolean
  durationSec: number
  bins: number[]
  reason: string
}

export type VerticeSetSession = {
  id: string
  recordId: string
  date: string
  startTime: string
  /** DJ/cabine — só deve ser lido ao abrir o registo. */
  operator: string
  /** Sequência de track ids do catálogo (+ fillers genéricos). */
  trackSequence: string[]
  bpmMeta?: string
  notes?: string
}

export type ArchiveQuery = {
  trackIds: string[]
  /** Exige adjacência ordenada trackIds[0] → trackIds[1]. */
  requireOrderedAdjacent?: boolean
}

function overlapSec(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0))
}

function hashBins(seed: string, n = 16): number[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    out.push(((h >>> 0) % 1000) / 1000)
  }
  return out
}

export const PUZZLE03_REGIONS = {
  A: { startSec: puzzle03Timing.preWindow.startSec, endSec: puzzle03Timing.preWindow.endSec },
  MIC: { startSec: puzzle03Timing.djStartSec, endSec: puzzle03Timing.djEndSec },
  B: { startSec: puzzle03Timing.postWindow.startSec, endSec: puzzle03Timing.postWindow.endSec },
} as const

/**
 * Catálogo local do arquivo do Vértice.
 * TRACK_REF_A aponta para a única fonte aprovada.
 * TRACK_REF_B é placeholder técnico até `P03_SECOND_TRACK_REQUIRED` ser resolvido
 * (NÃO trata stretch/BPM da mesma faixa como segunda música).
 * Decoys = entradas neutras (sem novos personagens / narrativa).
 */
export const PUZZLE03_FINGERPRINT_CATALOG: FingerprintCatalogEntry[] = [
  {
    id: PUZZLE03_TRACK_A_ID,
    title: 'TRACK_REF_A',
    versionLabel: 'Source A (approved)',
    durationSec: 60,
    sourceAssetPath: PUZZLE03_MUSIC_SOURCES.sourceA,
    reference: {
      tempoBpm: puzzle03Timing.actualPreTempo,
      region: 'A',
      bins: hashBins(`${PUZZLE03_TRACK_A_ID}|${PUZZLE03_MUSIC_SOURCES.sourceA}`),
    },
  },
  {
    id: PUZZLE03_TRACK_B_ID,
    title: 'TRACK_REF_B',
    versionLabel: 'PENDING ASSET — second track required',
    durationSec: 54,
    sourceAssetPath: PUZZLE03_MUSIC_SOURCES.sourceB,
    reference: {
      tempoBpm: puzzle03Timing.actualPostTempo,
      region: 'B',
      bins: hashBins(`${PUZZLE03_TRACK_B_ID}|PENDING`),
    },
  },
  {
    id: 'vtx-lib-decoy-124',
    title: 'Library stub · 124',
    versionLabel: 'Generic club edit',
    durationSec: 48,
    sourceAssetPath: null,
    reference: { tempoBpm: 124, region: 'decoy', bins: hashBins('decoy-124') },
  },
  {
    id: 'vtx-lib-decoy-130',
    title: 'Library stub · 130',
    versionLabel: 'Generic peak-time',
    durationSec: 52,
    sourceAssetPath: null,
    reference: { tempoBpm: 130, region: 'decoy', bins: hashBins('decoy-130') },
  },
  {
    id: 'vtx-lib-decoy-118',
    title: 'Library stub · 118',
    versionLabel: 'Generic warm-up',
    durationSec: 44,
    sourceAssetPath: null,
    reference: { tempoBpm: 118, region: 'decoy', bins: hashBins('decoy-118') },
  },
]

/** Sessões históricas pesquisáveis — fillers neutros + um canónico A→B. */
export const PUZZLE03_SET_SESSIONS: VerticeSetSession[] = [
  {
    id: 'vtx-set-2019-09-14-op-a',
    recordId: 'VTX-SET-19-A',
    date: '2019-09-14',
    startTime: '23:10',
    operator: 'Operador A',
    trackSequence: [PUZZLE03_TRACK_A_ID, 'vtx-lib-decoy-124', 'vtx-lib-decoy-130'],
    bpmMeta: '126→126',
    notes: 'Transição sem marcador de mic.',
  },
  {
    id: 'vtx-set-2019-10-02-op-b',
    recordId: 'VTX-SET-19-B',
    date: '2019-10-02',
    startTime: '00:40',
    operator: 'Operador B',
    trackSequence: [PUZZLE03_TRACK_A_ID, 'vtx-lib-decoy-118', PUZZLE03_TRACK_B_ID],
    bpmMeta: '126→128',
    notes: 'A e B presentes, não adjacentes.',
  },
  {
    id: 'vtx-set-2019-10-19-op-c',
    recordId: 'VTX-SET-19-C',
    date: '2019-10-19',
    startTime: '01:05',
    operator: 'Operador C',
    trackSequence: [PUZZLE03_TRACK_B_ID, PUZZLE03_TRACK_A_ID, 'vtx-lib-decoy-130'],
    bpmMeta: '128→126',
    notes: 'Ordem invertida B→A.',
  },
  {
    id: PUZZLE03_CANONICAL_SESSION_ID,
    recordId: 'VTX-SET-20-C',
    date: '2019-11-08',
    startTime: '01:12',
    operator: 'Nicolas Prado Reis (“Nico”)',
    trackSequence: [
      'vtx-lib-decoy-118',
      PUZZLE03_TRACK_A_ID,
      PUZZLE03_TRACK_B_ID,
      'vtx-lib-decoy-130',
    ],
    bpmMeta: '126.1→128.0',
    notes: 'Legacy desk ducking on mic open near transition.',
  },
  {
    id: 'vtx-set-2019-11-22-op-d',
    recordId: 'VTX-SET-20-D',
    date: '2019-11-22',
    startTime: '22:50',
    operator: 'Operador D',
    trackSequence: [PUZZLE03_TRACK_B_ID, 'vtx-lib-decoy-124'],
    bpmMeta: '128→128',
  },
  {
    id: 'vtx-set-2019-12-01-gen-1',
    recordId: 'VTX-SET-20-E',
    date: '2019-12-01',
    startTime: '23:30',
    operator: 'DJ (não identificado)',
    trackSequence: ['vtx-lib-decoy-118', 'vtx-lib-decoy-124'],
  },
  {
    id: 'vtx-set-2019-12-07-gen-2',
    recordId: 'VTX-SET-20-F',
    date: '2019-12-07',
    startTime: '00:15',
    operator: 'DJ (não identificado)',
    trackSequence: [PUZZLE03_TRACK_A_ID, 'vtx-lib-decoy-130', 'vtx-lib-decoy-124'],
  },
  {
    id: 'vtx-set-2019-12-14-gen-3',
    recordId: 'VTX-SET-20-G',
    date: '2019-12-14',
    startTime: '01:40',
    operator: 'DJ (não identificado)',
    trackSequence: ['vtx-lib-decoy-130', PUZZLE03_TRACK_B_ID],
  },
  {
    id: 'vtx-set-2020-01-04-gen-4',
    recordId: 'VTX-SET-21-A',
    date: '2020-01-04',
    startTime: '23:55',
    operator: 'DJ (não identificado)',
    trackSequence: ['vtx-lib-decoy-124', 'vtx-lib-decoy-118', 'vtx-lib-decoy-130'],
  },
  {
    id: 'vtx-set-2020-01-18-gen-5',
    recordId: 'VTX-SET-21-B',
    date: '2020-01-18',
    startTime: '00:50',
    operator: 'DJ (não identificado)',
    trackSequence: [PUZZLE03_TRACK_A_ID],
  },
  {
    id: 'vtx-set-2020-02-01-gen-6',
    recordId: 'VTX-SET-21-C',
    date: '2020-02-01',
    startTime: '02:10',
    operator: 'DJ (não identificado)',
    trackSequence: [PUZZLE03_TRACK_B_ID, 'vtx-lib-decoy-118', PUZZLE03_TRACK_A_ID],
    notes: 'B e A presentes; ordem B→…→A.',
  },
  {
    id: 'vtx-set-2020-02-15-gen-7',
    recordId: 'VTX-SET-21-D',
    date: '2020-02-15',
    startTime: '23:05',
    operator: 'DJ (não identificado)',
    trackSequence: ['vtx-lib-decoy-130', 'vtx-lib-decoy-124'],
  },
]

export function classifySelectionRegion(startSec: number, endSec: number): Puzzle03RegionId {
  const dur = Math.max(0.01, endSec - startSec)
  const pre = overlapSec(startSec, endSec, PUZZLE03_REGIONS.A.startSec, PUZZLE03_REGIONS.A.endSec) / dur
  const post = overlapSec(startSec, endSec, PUZZLE03_REGIONS.B.startSec, PUZZLE03_REGIONS.B.endSec) / dur
  const mic = overlapSec(startSec, endSec, PUZZLE03_REGIONS.MIC.startSec, PUZZLE03_REGIONS.MIC.endSec) / dur
  if (mic >= 0.45 && mic >= pre && mic >= post) return 'MIC'
  if (pre >= 0.55 && pre > post) return 'A'
  if (post >= 0.55 && post > pre) return 'B'
  return 'none'
}

export function computeSelectionFingerprint(
  startSec: number,
  endSec: number,
  tempoBpm: number | null,
): FingerprintVector {
  const durationSec = Math.max(0, endSec - startSec)
  const centerSec = (startSec + endSec) / 2
  const preOverlap =
    durationSec <= 0
      ? 0
      : overlapSec(startSec, endSec, PUZZLE03_REGIONS.A.startSec, PUZZLE03_REGIONS.A.endSec) /
        durationSec
  const postOverlap =
    durationSec <= 0
      ? 0
      : overlapSec(startSec, endSec, PUZZLE03_REGIONS.B.startSec, PUZZLE03_REGIONS.B.endSec) /
        durationSec
  const micOverlap =
    durationSec <= 0
      ? 0
      : overlapSec(startSec, endSec, PUZZLE03_REGIONS.MIC.startSec, PUZZLE03_REGIONS.MIC.endSec) /
        durationSec
  return { preOverlap, postOverlap, micOverlap, tempoBpm, durationSec, centerSec }
}

function binDistance(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (!n) return 1
  let sum = 0
  for (let i = 0; i < n; i++) sum += (a[i]! - b[i]!) ** 2
  return Math.sqrt(sum / n)
}

function selectionBins(fp: FingerprintVector): number[] {
  const seed = [
    fp.preOverlap.toFixed(3),
    fp.postOverlap.toFixed(3),
    fp.micOverlap.toFixed(3),
    (fp.tempoBpm ?? 0).toFixed(1),
    fp.durationSec.toFixed(1),
  ].join('|')
  return hashBins(seed)
}

/**
 * Fingerprint Search determinístico sobre o catálogo.
 * Seleção curta / mic / ambígua → hits fracos ou vazios.
 */
export function searchFingerprintCatalog(
  startSec: number,
  endSec: number,
  tempoBpm: number | null,
): FingerprintHit[] {
  const fp = computeSelectionFingerprint(startSec, endSec, tempoBpm)
  if (fp.durationSec < 6) {
    return [
      {
        trackId: '',
        title: '—',
        versionLabel: '',
        confidence: 0.08,
        strong: false,
        durationSec: fp.durationSec,
        bins: selectionBins(fp),
        reason: 'Seleção curta demais para fingerprint estável.',
      },
    ].filter((h) => h.trackId) // empty → no hits
  }

  const region = classifySelectionRegion(startSec, endSec)
  const selBins = selectionBins(fp)
  const hits: FingerprintHit[] = []

  for (const entry of PUZZLE03_FINGERPRINT_CATALOG) {
    let score = 0.1
    let reason = 'Correspondência residual fraca no catálogo.'

    const tempoDelta =
      fp.tempoBpm == null ? 8 : Math.abs(fp.tempoBpm - entry.reference.tempoBpm)
    const tempoScore = Math.max(0, 1 - tempoDelta / 6)
    const binScore = 1 - Math.min(1, binDistance(selBins, entry.reference.bins) * 2.2)

    if (entry.reference.region === 'A') {
      score = fp.preOverlap * 0.55 + tempoScore * 0.3 + (1 - fp.micOverlap) * 0.1 + binScore * 0.05
      reason =
        region === 'A'
          ? 'Assinatura compatível com região pré-intervenção.'
          : 'Afinidade parcial com bed ~126 BPM.'
    } else if (entry.reference.region === 'B') {
      score = fp.postOverlap * 0.55 + tempoScore * 0.3 + (1 - fp.micOverlap) * 0.1 + binScore * 0.05
      reason =
        region === 'B'
          ? 'Assinatura compatível com região pós-intervenção.'
          : 'Afinidade parcial com bed ~128 BPM.'
    } else {
      score = tempoScore * 0.35 + binScore * 0.2
      if (fp.micOverlap > 0.4) score *= 0.4
      reason = 'Entrada de catálogo genérica — confiança baixa.'
    }

    if (region === 'MIC') {
      score *= 0.25
      reason = 'Seleção dominada por microfone/público — fingerprint musical diluído.'
    }
    if (fp.durationSec > 50) score *= 0.7

    const strong =
      score >= 0.72 &&
      ((entry.reference.region === 'A' && fp.preOverlap >= 0.55 && fp.micOverlap < 0.35) ||
        (entry.reference.region === 'B' && fp.postOverlap >= 0.55 && fp.micOverlap < 0.35))

    hits.push({
      trackId: entry.id,
      title: entry.title,
      versionLabel: entry.versionLabel,
      confidence: Math.round(score * 1000) / 1000,
      strong,
      durationSec: entry.durationSec,
      bins: entry.reference.bins,
      reason: strong ? reason : reason,
    })
  }

  return hits.sort((a, b) => b.confidence - a.confidence)
}

export function sessionsContainingTrack(trackId: string): VerticeSetSession[] {
  return PUZZLE03_SET_SESSIONS.filter((s) => s.trackSequence.includes(trackId))
}

export function hasOrderedAdjacentPair(
  sequence: string[],
  trackA: string,
  trackB: string,
): boolean {
  for (let i = 0; i < sequence.length - 1; i++) {
    if (sequence[i] === trackA && sequence[i + 1] === trackB) return true
  }
  return false
}

export function queryVerticeArchive(query: ArchiveQuery): VerticeSetSession[] {
  const ids = query.trackIds.filter(Boolean)
  if (!ids.length) return [...PUZZLE03_SET_SESSIONS]

  let results = PUZZLE03_SET_SESSIONS.filter((s) => ids.every((id) => s.trackSequence.includes(id)))

  if (query.requireOrderedAdjacent && ids.length >= 2) {
    const [a, b] = ids
    results = results.filter((s) => hasOrderedAdjacentPair(s.trackSequence, a!, b!))
  }

  return results
}

export function summarizeTransition(
  fingerprintA: string | null,
  fingerprintB: string | null,
): 'A→B' | 'B→A' | 'incomplete' | 'same' {
  if (!fingerprintA || !fingerprintB) return 'incomplete'
  if (fingerprintA === fingerprintB) return 'same'
  if (fingerprintA === PUZZLE03_TRACK_A_ID && fingerprintB === PUZZLE03_TRACK_B_ID) return 'A→B'
  if (fingerprintA === PUZZLE03_TRACK_B_ID && fingerprintB === PUZZLE03_TRACK_A_ID) return 'B→A'
  return 'incomplete'
}

/** Conclusão técnica do puzzle (antes de revelar Nico no documento aberto). */
export function puzzle03TechnicalChainReady(state: {
  fingerprintAId: string | null
  fingerprintBId: string | null
  transitionOrder: 'A→B' | 'B→A' | 'incomplete' | 'same' | null
}): boolean {
  return (
    state.fingerprintAId === PUZZLE03_TRACK_A_ID &&
    state.fingerprintBId === PUZZLE03_TRACK_B_ID &&
    state.transitionOrder === 'A→B'
  )
}

/** Conclusão narrativa: sessão canónica aberta com cadeia técnica pronta. */
export function puzzle03NarrativeComplete(state: {
  fingerprintAId: string | null
  fingerprintBId: string | null
  transitionOrder: 'A→B' | 'B→A' | 'incomplete' | 'same' | null
  openedArchiveSessionId: string | null
}): boolean {
  return (
    puzzle03TechnicalChainReady(state) &&
    state.openedArchiveSessionId === PUZZLE03_CANONICAL_SESSION_ID
  )
}

export function sessionListHidesOperatorNames(results: VerticeSetSession[]): Array<{
  id: string
  recordId: string
  date: string
  startTime: string
  trackCount: number
}> {
  return results.map((s) => ({
    id: s.id,
    recordId: s.recordId,
    date: s.date,
    startTime: s.startTime,
    trackCount: s.trackSequence.length,
  }))
}
