/**
 * Puzzle 6 — Hexágono (estrutura definitiva).
 * TODO(puzzle-06): substituir o placeholder por inspeção real de metadata + grafo.
 *
 * Sequência cíclica: A → D → B → F → C → E → A
 * Palavras na ordem do ciclo: PROCURE / O / QUE / A / TELA / OMITE
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
  anomaly: string
  pointsTo: HexNodeId
  hiddenWord: string
  audioSrc: string
}

/** Ordem alfabética ≠ ordem do ciclo. */
export const HEX_NODES: HexNodeDef[] = [
  {
    id: 'A',
    evidenceId: 'hex_audio_a',
    displayName: 'FRAG_A.wav',
    durationSec: 6,
    sampleRate: 44100,
    channels: 'mono',
    codec: 'pcm',
    anomaly: 'sampleRate declarado aponta 22050 → nó D',
    pointsTo: 'D',
    hiddenWord: 'PROCURE',
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
    anomaly: 'checksum parcial → nó F',
    pointsTo: 'F',
    hiddenWord: 'QUE',
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
    anomaly: 'duração registrada → nó E',
    pointsTo: 'E',
    hiddenWord: 'TELA',
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
    anomaly: 'canais declarados stereo → nó B',
    pointsTo: 'B',
    hiddenWord: 'O',
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
    anomaly: 'container aponta de volta → nó A',
    pointsTo: 'A',
    hiddenWord: 'OMITE',
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
    anomaly: 'codec tag → nó C',
    pointsTo: 'C',
    hiddenWord: 'A',
    audioSrc: '/assets/audio/hex-f.wav',
  },
]

export const HEX_CYCLE: HexNodeId[] = ['A', 'D', 'B', 'F', 'C', 'E']

export const HEX_PHRASE = 'PROCURE O QUE A TELA OMITE'

export const HEX_EVIDENCE_IDS = HEX_NODES.map((n) => n.evidenceId)
