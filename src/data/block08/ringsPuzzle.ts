/**
 * Puzzle 10 — Ordem dos Anéis
 * Percurso de Morsa → passagem de serviço → DVR → CAM11_SEG_1279 → revelação.
 * Dataset técnico: src/forensic/puzzles/puzzle10Meta.json
 */

import meta from '../../forensic/puzzles/puzzle10Meta.json'

export const P10_ASSETS = '/assets/block08/rings/p10'

export const RING_MEDIA = {
  livia: {
    id: 'livia',
    label: 'Cobertura Lívia, trecho Maralto',
    kind: 'audio' as const,
    audioSrc: '/assets/audio/forensic/puzzle10/livia_protest_clip.wav',
    durationSec: 12,
    note: 'Protesto. sirene policial distintiva.',
  },
  samuel: {
    id: 'samuel',
    label: 'Vídeo de celular, material Samuel',
    kind: 'video' as const,
    audioSrc: '/assets/audio/forensic/puzzle10/samuel_phone_clip.wav',
    posterSrc: `${P10_ASSETS}/BG-01 — rua de aproximação.png`,
    spriteSrc: `${P10_ASSETS}/SP-01 — masked-walk-away-2.png`,
    durationSec: 10,
    note: 'Morsa noutro ponto. relógio do aparelho pouco confiável.',
  },
  secondary: {
    id: 'secondary',
    label: 'Arquivo secundário, percurso noturno',
    kind: 'video' as const,
    posterSrc: `${P10_ASSETS}/BG-02 — curva I transição.png`,
    spriteSrc: `${P10_ASSETS}/SP-01 — masked-walk-away-3.png`,
    durationSec: 8,
    note: 'Iluminação industrial. flicker/rolling shutter.',
  },
} as const

export type RingMediaId = keyof typeof RING_MEDIA

export const RING_FINGERPRINT = {
  liviaEnv: meta.liviaEnv as number[],
  samuelEnv: meta.samuelEnv as number[],
  wrongEnv: meta.wrongEnv as number[],
  threshold: meta.fingerprintThreshold as number,
  liviaSirenStartSec: meta.liviaSirenStartSec as number,
  samuelSirenStartSec: meta.samuelSirenStartSec as number,
  pattern: meta.sirenPattern as string,
}

export const RING_FRAME_PATTERN = {
  B: meta.framePatternB as number[],
  C: meta.framePatternC as number[],
  noise: meta.framePatternNoise as number[],
  threshold: meta.frameThreshold as number,
  label: meta.framePattern as string,
}

export type RingRouteId = 'west' | 'east' | 'service'

export interface RingRoute {
  id: RingRouteId
  label: string
  detail: string
  compatible: boolean
  backgrounds: string[]
}

export const RING_ROUTES: RingRoute[] = [
  {
    id: 'west',
    label: 'Rota externa oeste',
    detail: 'Contorno longo do complexo, incompatível com a janela temporal.',
    compatible: false,
    backgrounds: [`${P10_ASSETS}/BG-01 — rua de aproximação.png`],
  },
  {
    id: 'east',
    label: 'Rota externa leste',
    detail: 'Isolamento policial / estrutura bloqueada naquela noite.',
    compatible: false,
    backgrounds: [`${P10_ASSETS}/BG-01 — rua de aproximação.png`],
  },
  {
    id: 'service',
    label: 'Passagem de serviço',
    detail: 'Distância e intervalos compatíveis com as aparições conhecidas.',
    compatible: true,
    backgrounds: [
      `${P10_ASSETS}/BG-01 — rua de aproximação.png`,
      `${P10_ASSETS}/BG-02 — curva I transição.png`,
      `${P10_ASSETS}/BG-04 — corredor intermediário.png`,
      `${P10_ASSETS}/BG-05 — área final I asset já existente como destino.png`,
    ],
  },
]

export const RING_CAMERAS = [
  { id: 'CAM 03', covers: 'entrada da passagem', time: '21:14:08' },
  { id: 'CAM 07', covers: 'corredor intermediário', time: '21:14:31' },
  { id: 'CAM 11', covers: 'área norte / saída', time: '21:15:02' },
] as const

export interface DvrSegment {
  camera: string
  segmentId: string
  startTime: string
  durationSec: number
  codec: string
  container: string
  indexed: boolean
  checksum: string
  /** Present only for unindexed raw files. */
  rawPath?: string
  thumbnailAmbiguous?: boolean
}

/** Catálogo indexado — CAM11_SEG_1279 ausente. */
export const DVR_CATALOG: DvrSegment[] = [
  {
    camera: 'CAM 03',
    segmentId: 'CAM03_SEG_0440',
    startTime: '21:13:40',
    durationSec: 60,
    codec: 'H.264',
    container: 'MP4',
    indexed: true,
    checksum: 'a91c2e',
  },
  {
    camera: 'CAM 07',
    segmentId: 'CAM07_SEG_0901',
    startTime: '21:14:10',
    durationSec: 60,
    codec: 'H.264',
    container: 'MP4',
    indexed: true,
    checksum: 'b33f01',
  },
  {
    camera: 'CAM 11',
    segmentId: 'CAM11_SEG_1278',
    startTime: '21:14:00',
    durationSec: 60,
    codec: 'H.264',
    container: 'MP4',
    indexed: true,
    checksum: 'c70aa2',
  },
  {
    camera: 'CAM 11',
    segmentId: 'CAM11_SEG_1280',
    startTime: '21:16:00',
    durationSec: 60,
    codec: 'H.264',
    container: 'MP4',
    indexed: true,
    checksum: 'd12bb8',
  },
]

/** Storage bruto — inclui o segmento não indexado. */
export const DVR_RAW_STORAGE: DvrSegment[] = [
  ...DVR_CATALOG,
  {
    camera: 'CAM 11',
    segmentId: 'CAM11_SEG_1279',
    startTime: '21:15:00',
    durationSec: 60,
    codec: 'H.264',
    container: 'MP4',
    indexed: false,
    checksum: 'e9f401',
    rawPath: 'raw/cam11/CAM11_SEG_1279.mp4',
    thumbnailAmbiguous: true,
  },
]

export const MISSING_SEGMENT_ID = 'CAM11_SEG_1279'

export function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 4) return 0
  let sa = 0
  let sb = 0
  for (let i = 0; i < n; i++) {
    sa += a[i]!
    sb += b[i]!
  }
  const ma = sa / n
  const mb = sb / n
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < n; i++) {
    const xa = a[i]! - ma
    const xb = b[i]! - mb
    num += xa * xb
    da += xa * xa
    db += xb * xb
  }
  const den = Math.sqrt(da * db)
  return den < 1e-12 ? 0 : num / den
}

export function compareAudioFingerprints(
  left: RingMediaId,
  right: RingMediaId,
): { match: boolean; score: number; deltaSec: number | null; message: string } {
  const pair = [left, right].sort().join('+')
  if (pair === 'livia+samuel') {
    const score = pearson(RING_FINGERPRINT.liviaEnv, RING_FINGERPRINT.samuelEnv)
    const delta =
      RING_FINGERPRINT.samuelSirenStartSec - RING_FINGERPRINT.liviaSirenStartSec
    const match = score >= RING_FINGERPRINT.threshold
    return {
      match,
      score,
      deltaSec: match ? delta : null,
      message: match
        ? `Correlação forte — padrão de sirene. Δt ≈ ${delta.toFixed(2)} s entre relógios das fontes.`
        : 'Sobreposição de impressão digital insuficiente.',
    }
  }
  const score = pearson(RING_FINGERPRINT.liviaEnv, RING_FINGERPRINT.wrongEnv) * 0.4
  return {
    match: false,
    score: Math.max(0, score),
    deltaSec: null,
    message: 'Nenhum evento compartilhado forte entre as fontes escolhidas.',
  }
}

export function compareFramePatterns(
  left: RingMediaId,
  right: RingMediaId,
): { match: boolean; score: number; message: string } {
  const pair = [left, right].sort().join('+')
  if (pair === 'samuel+secondary') {
    const score = pearson(RING_FRAME_PATTERN.B, RING_FRAME_PATTERN.C)
    const match = score >= RING_FRAME_PATTERN.threshold
    return {
      match,
      score,
      message: match
        ? 'Sequência de iluminação / obturador compatível nos dois vídeos.'
        : 'Padrões de quadro divergentes.',
    }
  }
  const score = pearson(RING_FRAME_PATTERN.B, RING_FRAME_PATTERN.noise)
  return {
    match: false,
    score: Math.max(0, score),
    message: 'Nenhuma sequência de iluminação compartilhada.',
  }
}

export function inspectCam11Structure(): {
  gapSec: number
  expectedSegment: string
  message: string
} {
  return {
    gapSec: 60,
    expectedSegment: MISSING_SEGMENT_ID,
    message:
      'CAM11_SEG_1278 encerra 21:15:00. CAM11_SEG_1280 inicia 21:16:00, ~60 s ausentes do índice.',
  }
}

export function searchRawStorage(query: string): DvrSegment[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return DVR_RAW_STORAGE.filter(
    (s) =>
      s.segmentId.toLowerCase().includes(q) ||
      s.camera.toLowerCase().replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
      (s.rawPath ?? '').toLowerCase().includes(q),
  )
}

/** @deprecated legacy placeholder order — kept for story tests / checkpoints. */
export type RingSourceId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
/** @deprecated */
export const RING_TRUE_ORDER: RingSourceId[] = ['A', 'B', 'E', 'D', 'C', 'F']
/** @deprecated */
export const RING_SOURCES: { id: RingSourceId; label: string }[] = RING_TRUE_ORDER.map((id) => ({
  id,
  label: id,
}))
/** @deprecated */
export function isRingOrderCorrect(order: RingSourceId[]): boolean {
  return order.length === RING_TRUE_ORDER.length && order.every((id, i) => id === RING_TRUE_ORDER[i])
}
/** @deprecated */
export function rawOrderByTimestamp(): RingSourceId[] {
  return ['B', 'A', 'D', 'F', 'C', 'E']
}

/** Sprite overlay — % of the 16:9 CCTV frame (anchor: bottom-left of sprite box). */
export interface CctvSpritePose {
  leftPct: number
  bottomPct: number
  heightPct: number
}

export interface RingContinuityFrame {
  id: string
  timeLabel: string
  cameraId: string
  caption: string
  bgSrc: string
  sprites: string[]
  masked: boolean
  /** One pose per sprite index; tuned to each BG vanishing point. */
  spritePoses: CctvSpritePose[]
}

export function resolveCctvSpritePose(frame: RingContinuityFrame, spriteIndex: number): CctvSpritePose {
  const poses = frame.spritePoses
  const hit = poses[spriteIndex]
  if (hit) return hit
  const fallback = poses[poses.length - 1] ?? { leftPct: 52, bottomPct: 4, heightPct: 52 }
  return {
    ...fallback,
    leftPct: fallback.leftPct + Math.max(0, spriteIndex - poses.length + 1) * 2,
  }
}

export const RING_CONTINUITY_FRAMES: RingContinuityFrame[] = [
  {
    id: 'cam03',
    timeLabel: '21:14:08',
    cameraId: 'CAM 03',
    caption: 'Entra na passagem, mascarado.',
    bgSrc: `${P10_ASSETS}/BG-02 — curva I transição.png`,
    sprites: [
      `${P10_ASSETS}/SP-01 — masked-walk-away-1.png`,
      `${P10_ASSETS}/SP-01 — masked-walk-away-2.png`,
      `${P10_ASSETS}/SP-04 — masked-enter-passage.png`,
    ],
    masked: true,
    spritePoses: [
      { leftPct: 63, bottomPct: 3, heightPct: 50 },
      { leftPct: 59, bottomPct: 3, heightPct: 51 },
      { leftPct: 54, bottomPct: 2, heightPct: 54 },
    ],
  },
  {
    id: 'cam07',
    timeLabel: '21:14:31',
    cameraId: 'CAM 07',
    caption: 'Corredor intermediário, ainda mascarado.',
    bgSrc: `${P10_ASSETS}/BG-04 — corredor intermediário.png`,
    sprites: [
      `${P10_ASSETS}/SP-01 — masked-walk-away-1.png`,
      `${P10_ASSETS}/SP-01 — masked-walk-away-2.png`,
      `${P10_ASSETS}/SP-01 — masked-walk-away-3.png`,
      `${P10_ASSETS}/SP-01 — masked-walk-away-4.png`,
      `${P10_ASSETS}/SP-03 — masked-turn-look.png`,
    ],
    masked: true,
    spritePoses: [
      { leftPct: 42, bottomPct: 2, heightPct: 52 },
      { leftPct: 46, bottomPct: 2, heightPct: 53 },
      { leftPct: 50, bottomPct: 2, heightPct: 54 },
      { leftPct: 54, bottomPct: 2, heightPct: 55 },
      { leftPct: 48, bottomPct: 2, heightPct: 57 },
    ],
  },
  {
    id: 'cam11',
    timeLabel: '21:15:02',
    cameraId: 'CAM 11',
    caption: 'Área norte.',
    bgSrc: `${P10_ASSETS}/BG-05 — área final I asset já existente como destino.png`,
    sprites: [
      `${P10_ASSETS}/SP-01 — masked-walk-away-3.png`,
      `${P10_ASSETS}/SP-01 — masked-walk-away-4.png`,
      `${P10_ASSETS}/SP-05 — unmasked-emerge-1.png`,
      `${P10_ASSETS}/SP-05 — unmasked-emerge-2.png`,
    ],
    masked: false,
    spritePoses: [
      { leftPct: 52, bottomPct: 2, heightPct: 52 },
      { leftPct: 48, bottomPct: 2, heightPct: 53 },
      { leftPct: 45, bottomPct: 1, heightPct: 58 },
      { leftPct: 43, bottomPct: 1, heightPct: 62 },
    ],
  },
]
