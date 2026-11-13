/**
 * Puzzle 12 — MEMÓRIA.
 * Mensagem final composta: apartamento → emergência → Enceladus → Cassini derived.
 * Sem sliders / % / deepfake mágico. Search Case Media + proveniência.
 */

import meta from '../../forensic/puzzles/puzzle12Meta.json'

export const MEMORY_WORD = 'MEMÓRIA'

export type MemorySourceId = 'apartment' | 'emergency' | 'enceladus' | 'cassini_derived'

export type MemoryRegionId = 'A' | 'B' | 'C' | 'D'

export interface MemoryRegion {
  id: MemoryRegionId
  start: number
  end: number
  source: MemorySourceId
  label: string
}

export interface CaseMediaEntry {
  id: string
  label: string
  kind: 'original' | 'derived' | 'reference'
  source: MemorySourceId | 'other'
  audioSrc: string
  /** Parent material when derived. */
  parentLabel?: string
  sha256?: string
  createdAt?: string
  evidenceHint?: string
}

const REG = meta.regions as Record<
  MemoryRegionId,
  { start: number; end: number; source: string; label: string }
>

export const MEMORY_DURATION_SEC = meta.durationSec as number
export const MEMORY_FINAL_SRC = meta.audio.final as string
export const MEMORY_FP_THRESHOLD = meta.fingerprintThreshold as number
export const MEMORY_WIDE_MAX_SEC = meta.wideSelectionMaxSec as number

export const MEMORY_REGIONS: MemoryRegion[] = (['A', 'B', 'C', 'D'] as MemoryRegionId[]).map(
  (id) => ({
    id,
    start: REG[id].start,
    end: REG[id].end,
    source: REG[id].source as MemorySourceId,
    label: REG[id].label,
  }),
)

export const CASSINI_DERIVED_META = {
  kind: meta.cassiniDerived.kind as string,
  path: meta.cassiniDerived.path as string,
  publicUrl: meta.cassiniDerived.publicUrl as string,
  parentPcap: meta.cassiniDerived.parentPcap as string | null,
  parentPcapUrl: meta.cassiniDerived.parentPcapUrl as string,
  sha256: meta.cassiniDerived.sha256 as string,
  createdAt: meta.cassiniDerived.createdAt as string,
  note: meta.cassiniDerived.note as string,
}

export const FINAL_MESSAGE_META = {
  sha256: meta.finalMessage.sha256 as string,
  createdAt: meta.finalMessage.createdAt as string,
  path: meta.finalMessage.path as string,
}

export const MEMORY_SCORES = meta.scores as Record<string, number>

export const CASE_MEDIA_CORPUS: CaseMediaEntry[] = [
  {
    id: 'media-apartment',
    label: 'Referência acústica — apartamento de Mariana',
    kind: 'reference',
    source: 'apartment',
    audioSrc: meta.audio.apartment,
    evidenceHint: 'Room tone / HVAC do ambiente residencial',
  },
  {
    id: 'media-emergency',
    label: 'Chamada de emergência 08:03 — fingerprint vocal',
    kind: 'original',
    source: 'emergency',
    audioSrc: meta.audio.emergency,
    evidenceHint: 'Material do Puzzle 01 / EMG_0803',
  },
  {
    id: 'media-emergency-base',
    label: 'Base corrompida — emergência (arquivo do caso)',
    kind: 'original',
    source: 'emergency',
    audioSrc: '/assets/audio/forensic/puzzle01/p01_corrupted_base.wav',
    evidenceHint: 'emergency_call_raw',
  },
  {
    id: 'media-enceladus',
    label: 'Enceladus — padrão periódico recuperado',
    kind: 'derived',
    source: 'enceladus',
    audioSrc: meta.audio.enceladus,
    parentLabel: 'AUD_0008 / p08_enceladus_final',
    evidenceHint: 'anon_hospital_burst_audio',
  },
  {
    id: 'media-cassini-derived',
    label: 'Cassini-Huygens — stream B reconstruído (output derivado)',
    kind: 'derived',
    source: 'cassini_derived',
    audioSrc: meta.audio.cassiniDerived,
    parentLabel: 'hv_session_capture.pcap',
    sha256: CASSINI_DERIVED_META.sha256,
    createdAt: CASSINI_DERIVED_META.createdAt,
    evidenceHint: 'henrique_rtp_capture → stream_b_reconstructed',
  },
  {
    id: 'media-cassini-capture',
    label: 'Cassini-Huygens — stream B em ordem de captura (não reconstruído)',
    kind: 'original',
    source: 'other',
    audioSrc: meta.audio.cassiniCaptureOrder,
    parentLabel: 'hv_session_capture.pcap',
    evidenceHint: 'Mesmo PCAP; sem artefato de reconstrução',
  },
  {
    id: 'media-cassini-pcap',
    label: 'PCAP original — hv_session_capture.pcap',
    kind: 'original',
    source: 'other',
    audioSrc: meta.audio.cassiniCaptureOrder,
    evidenceHint: 'Pacotes brutos — sem o output derivado da bancada',
  },
]

export type ProvenanceConfirmId = MemorySourceId

export interface SearchHit {
  mediaId: string
  label: string
  score: number
  strong: boolean
  source: MemorySourceId | 'other'
  kind: CaseMediaEntry['kind']
  reason: string
  sha256?: string
  createdAt?: string
  parentLabel?: string
  regionHint: MemoryRegionId | null
}

function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0))
}

function bestRegion(start: number, end: number): { region: MemoryRegion; ratio: number } | null {
  let best: { region: MemoryRegion; ratio: number } | null = null
  const selLen = Math.max(0.01, end - start)
  for (const r of MEMORY_REGIONS) {
    const ov = overlap(start, end, r.start, r.end)
    const regionLen = r.end - r.start
    const ratio = ov / regionLen
    const coverage = ov / selLen
    // Prefer selections that cover most of a region without being huge
    const score = ratio * 0.65 + coverage * 0.35
    if (!best || score > best.ratio) best = { region: r, ratio: score }
  }
  return best
}

const SOURCE_SCORE_KEY: Record<MemorySourceId, string> = {
  apartment: 'A_apartment',
  emergency: 'B_emergency',
  enceladus: 'C_enceladus',
  cassini_derived: 'D_cassini_derived',
}

/**
 * Search Case Media — só materiais do caso.
 * Seleção larga/errada → hits fracos ou genéricos.
 */
export function searchCaseMedia(start: number, end: number): SearchHit[] {
  if (end <= start) return []
  const dur = end - start
  const wide = dur > MEMORY_WIDE_MAX_SEC
  const best = bestRegion(start, end)
  const hits: SearchHit[] = []

  if (wide || !best || best.ratio < 0.45) {
    // Weak / generic — does not resolve the puzzle (deterministic)
    const jitter = ((start * 10 + end * 3) % 7) * 0.01
    for (const m of CASE_MEDIA_CORPUS.slice(0, 3)) {
      hits.push({
        mediaId: m.id,
        label: m.label,
        score: 0.12 + jitter,
        strong: false,
        source: m.source,
        kind: m.kind,
        reason: wide
          ? 'Seleção ampla demais — assinatura diluída no acervo.'
          : 'Sobreposição fraca com qualquer janela característica.',
        regionHint: null,
      })
    }
    return hits.sort((a, b) => b.score - a.score)
  }

  const region = best.region
  const fp = MEMORY_SCORES[SOURCE_SCORE_KEY[region.source]] ?? 0

  for (const m of CASE_MEDIA_CORPUS) {
    let score = 0.08
    let strong = false
    let reason = 'Correspondência residual no acervo.'

    if (m.source === region.source) {
      // Prefer the canonical reference entry per source (first match stays strongest)
      const canonicalId =
        region.source === 'apartment'
          ? 'media-apartment'
          : region.source === 'emergency'
            ? 'media-emergency'
            : region.source === 'enceladus'
              ? 'media-enceladus'
              : 'media-cassini-derived'
      score = fp * (0.85 + 0.15 * best.ratio)
      if (m.id !== canonicalId) score *= 0.72
      strong = m.id === canonicalId && score >= MEMORY_FP_THRESHOLD && best.ratio >= 0.55
      reason = strong
        ? 'Assinatura compatível com a janela selecionada.'
        : 'Possível afinidade — confirme abrindo a fonte.'
    } else if (region.source === 'cassini_derived' && m.id === 'media-cassini-capture') {
      score = (MEMORY_SCORES.D_vs_capture_order ?? 0.3) * 0.7
      strong = false
      reason = 'Sobreposição parcial com stream em ordem de captura — não é o artefato reconstruído.'
    } else if (region.source === 'cassini_derived' && m.id === 'media-cassini-pcap') {
      score = 0.18
      strong = false
      reason = 'O PCAP original não contém o artefato do decode reconstruído.'
    }

    hits.push({
      mediaId: m.id,
      label: m.label,
      score,
      strong,
      source: m.source,
      kind: m.kind,
      reason,
      sha256: m.sha256,
      createdAt: m.createdAt,
      parentLabel: m.parentLabel,
      regionHint: m.source === region.source ? region.id : null,
    })
  }

  return hits.sort((a, b) => b.score - a.score)
}

export function regionForSource(source: MemorySourceId): MemoryRegion {
  return MEMORY_REGIONS.find((r) => r.source === source)!
}

export function isTemporalImpossibility(confirmed: Set<ProvenanceConfirmId>): boolean {
  return confirmed.has('cassini_derived')
}

export function isMemoryProvenanceComplete(confirmed: Set<ProvenanceConfirmId>): boolean {
  return (
    confirmed.has('apartment') &&
    confirmed.has('emergency') &&
    confirmed.has('enceladus') &&
    confirmed.has('cassini_derived') &&
    isTemporalImpossibility(confirmed)
  )
}

/** @deprecated placeholder API — e2e antigo usava assign por segmento. */
export type MemorySegment = {
  id: string
  label: string
  tStart: number
  tEnd: number
  trueSource: MemorySourceId | 'cassini'
  hint: string
}

/** Compat: mapeia cassini → cassini_derived para saves/e2e legados. */
export const MEMORY_SEGMENTS: MemorySegment[] = MEMORY_REGIONS.map((r) => ({
  id: `seg-${r.id.toLowerCase()}`,
  label: `Trecho ${r.id}`,
  tStart: r.start,
  tEnd: r.end,
  trueSource: r.source === 'cassini_derived' ? 'cassini' : r.source,
  hint: r.label,
}))

export const MEMORY_SOURCES: { id: MemorySourceId | 'cassini'; label: string }[] = [
  { id: 'apartment', label: 'Acústica do apartamento de Mariana' },
  { id: 'emergency', label: 'Chamada de emergência (08:03)' },
  { id: 'enceladus', label: 'Padrão Enceladus (hospitalar)' },
  { id: 'cassini', label: 'Output derivado Cassini-Huygens' },
  { id: 'cassini_derived', label: 'Output derivado Cassini-Huygens' },
]

export function isMemoryProvenanceCompleteLegacy(
  assigned: Record<string, string>,
): boolean {
  return MEMORY_SEGMENTS.every((s) => {
    const v = assigned[s.id]
    if (s.trueSource === 'cassini') return v === 'cassini' || v === 'cassini_derived'
    return v === s.trueSource
  })
}
