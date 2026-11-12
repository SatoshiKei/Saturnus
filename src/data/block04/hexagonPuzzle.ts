/**
 * Puzzle 06 — HEXÁGONO
 * Seis arquivos anônimos (UNK_01…06) com padrões espectrais I/V → algarismos romanos → PIN.
 * A Bancada não valida o PIN; o diário oculto aceita HEX_PIN.
 */

export type HexFileId = 'UNK_01' | 'UNK_02' | 'UNK_03' | 'UNK_04' | 'UNK_05' | 'UNK_06'

export interface HexFileDef {
  id: HexFileId
  evidenceId: string
  displayName: string
  durationSec: number
  texture: string
  /** Algarismo romano esperado (DEV / testes). */
  expectedSymbol: string
  digit: string
  iCount: number
  vCount: number
  audioSrc: string
}

/** PIN canônico do diário. Nunca revelado automaticamente pela bancada. */
export const HEX_PIN = '481526'

export const HEX_FILES: HexFileDef[] = [
  {
    id: 'UNK_01',
    evidenceId: 'hex_audio_unk_01',
    displayName: 'UNK_01.wav',
    durationSec: 6.8,
    texture: 'electrical',
    expectedSymbol: 'IV',
    digit: '4',
    iCount: 1,
    vCount: 1,
    audioSrc: '/assets/audio/forensic/puzzle06/UNK_01.wav',
  },
  {
    id: 'UNK_02',
    evidenceId: 'hex_audio_unk_02',
    displayName: 'UNK_02.wav',
    durationSec: 8.4,
    texture: 'metallic',
    expectedSymbol: 'VIII',
    digit: '8',
    iCount: 3,
    vCount: 1,
    audioSrc: '/assets/audio/forensic/puzzle06/UNK_02.wav',
  },
  {
    id: 'UNK_03',
    evidenceId: 'hex_audio_unk_03',
    displayName: 'UNK_03.wav',
    durationSec: 5.1,
    texture: 'airy',
    expectedSymbol: 'I',
    digit: '1',
    iCount: 1,
    vCount: 0,
    audioSrc: '/assets/audio/forensic/puzzle06/UNK_03.wav',
  },
  {
    id: 'UNK_04',
    evidenceId: 'hex_audio_unk_04',
    displayName: 'UNK_04.wav',
    durationSec: 7.3,
    texture: 'pulsing',
    expectedSymbol: 'V',
    digit: '5',
    iCount: 0,
    vCount: 1,
    audioSrc: '/assets/audio/forensic/puzzle06/UNK_04.wav',
  },
  {
    id: 'UNK_05',
    evidenceId: 'hex_audio_unk_05',
    displayName: 'UNK_05.wav',
    durationSec: 5.9,
    texture: 'granular',
    expectedSymbol: 'II',
    digit: '2',
    iCount: 2,
    vCount: 0,
    audioSrc: '/assets/audio/forensic/puzzle06/UNK_05.wav',
  },
  {
    id: 'UNK_06',
    evidenceId: 'hex_audio_unk_06',
    displayName: 'UNK_06.wav',
    durationSec: 7.8,
    texture: 'unstable',
    expectedSymbol: 'VI',
    digit: '6',
    iCount: 1,
    vCount: 1,
    audioSrc: '/assets/audio/forensic/puzzle06/UNK_06.wav',
  },
]

export const HEX_EVIDENCE_IDS = HEX_FILES.map((f) => f.evidenceId)

export function hexFile(id: HexFileId): HexFileDef {
  return HEX_FILES.find((f) => f.id === id)!
}

export function hexFileByEvidence(evidenceId: string): HexFileDef | undefined {
  return HEX_FILES.find((f) => f.evidenceId === evidenceId)
}

export function expectedPinFromSymbols(): string {
  return HEX_FILES.map((f) => f.digit).join('')
}

export function spectrogramViewedFlag(id: HexFileId): string {
  return `hex_spec_viewed_${id}`
}

/** Compat: nomes antigos do ciclo de metadados — removidos. */
export type HexNodeId = HexFileId
export const HEX_NODES = HEX_FILES
export const HEX_CYCLE = HEX_FILES.map((f) => f.id)
export const HEX_PHRASE = 'Os seis arquivos contêm padrões espectrais deliberadamente estruturados.'
