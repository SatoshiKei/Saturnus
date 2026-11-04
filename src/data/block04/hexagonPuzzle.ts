/**
 * Puzzle 6 — Hexágono.
 *
 * Seis arquivos de áudio formam um ciclo: cada metadata aponta para o próximo.
 * Cada arquivo carrega UM fragmento de texto e UM dígito (ambos só aparecem ao inspecionar os
 * metadados). Ordem do ciclo (começando pelo arquivo mais antigo):
 *
 *   A → D → B → F → C → E → (A)
 *
 * | Arquivo | Aponta para | Fragmento    | Dígito |
 * |---------|-------------|--------------|--------|
 * | A       | D           | NO TELEFONE  | 4      |
 * | D       | B           | HÁ           | 8      |
 * | B       | F           | UM DIÁRIO    | 1      |
 * | F       | C           | QUE          | 5      |
 * | C       | E           | A TELA       | 2      |
 * | E       | A           | OMITE        | 6      |
 *
 * Frase final: NO TELEFONE HÁ UM DIÁRIO QUE A TELA OMITE
 * Código (PIN do diário): 481526 — nunca exibido antes de o puzzle ser resolvido.
 *
 * A mecânica de DSP/metadata continua simplificada (inspeção de campos), mas o resultado narrativo
 * é definitivo. TODO(puzzle-06): análise real de espectro/embedded tags.
 */

export type HexNodeId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface HexNodeDef {
  id: HexNodeId
  evidenceId: string
  displayName: string
  durationSec: number
  sampleRate: number
  channels: string
  codec: string
  /** Ordem de criação (1 = mais antigo): marca o começo do ciclo. */
  createdRank: number
  /** Campo de metadata que aponta para o próximo arquivo. */
  pointerField: string
  pointsTo: HexNodeId
  /** Fragmento de texto embutido (só aparece ao inspecionar). */
  fragment: string
  /** Dígito embutido (só aparece ao inspecionar). */
  digit: string
  audioSrc: string
}

export const HEX_NODES: HexNodeDef[] = [
  {
    id: 'A',
    evidenceId: 'hex_audio_a',
    displayName: 'FRAG_A.wav',
    durationSec: 6,
    sampleRate: 44100,
    channels: 'mono',
    codec: 'pcm',
    createdRank: 1,
    pointerField: 'sampleRate declarado: 22050',
    pointsTo: 'D',
    fragment: 'NO TELEFONE',
    digit: '4',
    audioSrc: '/assets/audio/hex-a.wav',
  },
  {
    id: 'B',
    evidenceId: 'hex_audio_b',
    displayName: 'FRAG_B.wav',
    durationSec: 9,
    sampleRate: 48000,
    channels: 'stereo',
    codec: 'pcm',
    createdRank: 3,
    pointerField: 'checksum parcial: …F',
    pointsTo: 'F',
    fragment: 'UM DIÁRIO',
    digit: '1',
    audioSrc: '/assets/audio/hex-b.wav',
  },
  {
    id: 'C',
    evidenceId: 'hex_audio_c',
    displayName: 'FRAG_C.wav',
    durationSec: 7,
    sampleRate: 32000,
    channels: 'mono',
    codec: 'adpcm',
    createdRank: 5,
    pointerField: 'duração registrada: 00:08 (arquivo E)',
    pointsTo: 'E',
    fragment: 'A TELA',
    digit: '2',
    audioSrc: '/assets/audio/hex-c.wav',
  },
  {
    id: 'D',
    evidenceId: 'hex_audio_d',
    displayName: 'FRAG_D.wav',
    durationSec: 5,
    sampleRate: 22050,
    channels: 'mono',
    codec: 'pcm',
    createdRank: 2,
    pointerField: 'canais declarados: stereo (arquivo B)',
    pointsTo: 'B',
    fragment: 'HÁ',
    digit: '8',
    audioSrc: '/assets/audio/hex-d.wav',
  },
  {
    id: 'E',
    evidenceId: 'hex_audio_e',
    displayName: 'FRAG_E.wav',
    durationSec: 8,
    sampleRate: 44100,
    channels: 'stereo',
    codec: 'pcm',
    createdRank: 6,
    pointerField: 'container aponta de volta ao primeiro arquivo',
    pointsTo: 'A',
    fragment: 'OMITE',
    digit: '6',
    audioSrc: '/assets/audio/hex-e.wav',
  },
  {
    id: 'F',
    evidenceId: 'hex_audio_f',
    displayName: 'FRAG_F.wav',
    durationSec: 4,
    sampleRate: 16000,
    channels: 'mono',
    codec: 'opus',
    createdRank: 4,
    pointerField: 'tag de codec: …C',
    pointsTo: 'C',
    fragment: 'QUE',
    digit: '5',
    audioSrc: '/assets/audio/hex-f.wav',
  },
]

/** Ordem alfabética ≠ ordem do ciclo. */
export const HEX_CYCLE: HexNodeId[] = ['A', 'D', 'B', 'F', 'C', 'E']

export const HEX_PHRASE = 'NO TELEFONE HÁ UM DIÁRIO QUE A TELA OMITE'

/** PIN canônico do diário. Só é revelado depois da resolução do Hexágono. */
export const HEX_PIN = '481526'

export const HEX_EVIDENCE_IDS = HEX_NODES.map((n) => n.evidenceId)

export function hexNode(id: HexNodeId): HexNodeDef {
  return HEX_NODES.find((n) => n.id === id)!
}

/** Frase e código montados a partir de uma sequência escolhida pelo jogador. */
export function assembleHex(sequence: HexNodeId[]): { phrase: string; code: string } {
  return {
    phrase: sequence.map((id) => hexNode(id).fragment).join(' '),
    code: sequence.map((id) => hexNode(id).digit).join(''),
  }
}

export function isHexSolved(sequence: HexNodeId[]): boolean {
  return sequence.length === HEX_CYCLE.length && sequence.every((id, i) => id === HEX_CYCLE[i])
}
