import type { ForensicSession, StructurePage } from '../forensicTypes'
import { buildCompositeWaveform } from '../forensicMix'

const FULL_SRC = '/assets/audio/forensic/puzzle02/rafael_1610_2147_full.mp3'

/** Duração real do asset Rafael — Vértice Full Audio - Novo. */
export const puzzle02ContainerDurationSec = 33.411
/**
 * Truncamento após “…Já trabalhei com ele.”
 * Região do Vértice fica inacessível até rebuild.
 */
export const puzzle02DamagedPlayableUntilSec = 22.26

const SERIAL = '0xA41C02F1'

function crcOf(pageIndex: number, sequence: number, flags: string): string {
  // CRC simulado determinístico — não é CRC Ogg real.
  let h = (pageIndex + 1) * 0x45d9f3b
  h ^= sequence * 0x27d4eb2d
  for (let i = 0; i < flags.length; i++) h = (h * 33 + flags.charCodeAt(i)) >>> 0
  return `0x${(h >>> 0).toString(16).padStart(8, '0')}`
}

function makePages(): StructurePage[] {
  const specs: Array<{
    flags: string
    granule: string
    segments: number
    sequence: number
    expectedSequence: number
  }> = [
    { flags: 'BOS', granule: '0', segments: 1, sequence: 0, expectedSequence: 0 },
    { flags: '', granule: '2880', segments: 4, sequence: 1, expectedSequence: 1 },
    { flags: '', granule: '5760', segments: 4, sequence: 2, expectedSequence: 2 },
    { flags: '', granule: '9600', segments: 5, sequence: 3, expectedSequence: 3 },
    { flags: '', granule: '13440', segments: 4, sequence: 4, expectedSequence: 4 },
    // Corrupção: sequence 12 em vez de 5 — packet CONTINUED quebrado.
    { flags: 'CONTINUED', granule: '17280', segments: 3, sequence: 12, expectedSequence: 5 },
    { flags: '', granule: '21120', segments: 4, sequence: 6, expectedSequence: 6 },
    { flags: '', granule: '24960', segments: 4, sequence: 7, expectedSequence: 7 },
    { flags: 'EOS', granule: '28800', segments: 2, sequence: 8, expectedSequence: 8 },
  ]
  return specs.map((s, index) => {
    const expectedOk = s.sequence === s.expectedSequence
    // CRC armazenado reflete o header esperado; sequence corrompida → mismatch.
    const storedCrc = crcOf(index, s.expectedSequence, s.flags)
    return {
      id: `page-${index}`,
      index,
      offset: `0x${(index * 0x480).toString(16).padStart(4, '0')}`,
      flags: s.flags || '—',
      granule: s.granule,
      serial: SERIAL,
      sequence: s.sequence,
      expectedSequence: s.expectedSequence,
      segments: s.segments,
      storedCrc,
      crcStatus: expectedOk ? 'valid' : 'mismatch',
      editableFields: ['sequence'],
    }
  })
}

export const puzzle02Pages = makePages()
export const puzzle02CorruptPageId = 'page-5'
export const puzzle02ExpectedSequence = 5

export const puzzle02SpeechSegments = [
  {
    id: 'seg_vertice',
    text: 'isso aí foi gravado no Vértice',
    startSec: 25.74,
    durationSec: 1.52,
    clarityThreshold: 0.55,
    recoveryWeights: { center: 0.25, depth: 0.25, width: 0.25, noise: 0.25 },
    voiceWeight: 1,
    requiresContainerRebuild: true,
  },
  {
    id: 'seg_cabine',
    text: 'talvez dê pra descobrir quem tava na cabine',
    startSec: 31.3,
    durationSec: 1.88,
    clarityThreshold: 0.55,
    recoveryWeights: { center: 0.25, depth: 0.25, width: 0.25, noise: 0.25 },
    voiceWeight: 1,
    requiresContainerRebuild: true,
  },
] as const

export const puzzle02IapetusSession: ForensicSession = {
  id: 'puzzle-02-iapetus',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'rafael_voice_to_augusto',
  completion: {
    kind: 'container-rebuild',
    onCompleteAction: 'runProvisionalRafaelForwardAnalysis',
    requireSpeechSegmentIds: ['seg_vertice'],
  },
  sources: [
    {
      id: 'rafael_1610_2147',
      filename: 'rafael_1610_2147.ogg',
      displayName: 'rafael_1610_2147.ogg',
      type: 'audio',
      durationSec: puzzle02ContainerDurationSec,
      tracks: [
        {
          id: 'master',
          name: 'MASTER',
          channel: '1 / mono',
          visible: true,
          gainDb: 0,
          pan: 0,
        },
      ],
      metadata: [
        { key: 'filename', label: 'Filename', value: 'rafael_1610_2147.ogg' },
        { key: 'container', label: 'Container', value: 'Ogg' },
        { key: 'codec', label: 'Codec', value: 'Opus' },
        { key: 'containerDuration', label: 'Container duration', value: '00:33.411' },
        { key: 'decodedDuration', label: 'Decoded duration', value: '00:22.260' },
        { key: 'channels', label: 'Channels', value: '1' },
        { key: 'sampleRate', label: 'Sample rate', value: '48000 Hz' },
        { key: 'created', label: 'Created', value: '2026-11-03 21:47:10' },
        { key: 'source', label: 'Source', value: 'WhatsApp · Rafael → Augusto (análise prévia)' },
        { key: 'size', label: 'Size', value: '539 KB' },
        { key: 'hash', label: 'Hash', value: 'sha1:9b1e…c4a2' },
        { key: 'decodeNote', label: 'Decode', value: 'Decode ended before container EOF.' },
      ],
      structure: {
        kind: 'ogg-opus',
        canRebuild: true,
        pages: puzzle02Pages,
        rebuildRule: {
          kind: 'sequence-repair',
          corruptPageId: puzzle02CorruptPageId,
          expectedSequence: puzzle02ExpectedSequence,
        },
      },
      packets: {
        emptyMessage: 'Packet table derived from Ogg pages — use Structure.',
      },
      timing: {
        sourceClock: undefined,
      },
      containerPlayback: {
        containerDurationSec: puzzle02ContainerDurationSec,
        damagedPlayableUntilSec: puzzle02DamagedPlayableUntilSec,
      },
      speechSegments: [...puzzle02SpeechSegments],
      audio: {
        sampleRate: 48000,
        channels: 1,
        seed: 16102147,
        waveform: buildCompositeWaveform({
          durationSec: puzzle02ContainerDurationSec,
          seed: 16102147,
          noiseFloor: 0.12,
          voice: [
            { startSec: 0.4, endSec: 22.2, amplitude: 0.75 },
            { startSec: 22.8, endSec: 33.2, amplitude: 0.7 },
          ],
        }),
        stems: [
          {
            id: 'FILE',
            kind: 'file',
            initialGain: 1,
            src: FULL_SRC,
          },
        ],
      },
    },
  ],
}
