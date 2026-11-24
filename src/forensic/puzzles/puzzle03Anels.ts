import type { ForensicSession, ForensicSource, SpeechSegment } from '../forensicTypes'
import { buildCompositeWaveform } from '../forensicMix'
import voiceMeta from './puzzle03VoiceMeta.json'
import { puzzle03Timing as legacyTiming } from './puzzle03Fingerprint'

/** Compat: timing de build + janela de voz masculina (nico). */
export const puzzle03Timing = {
  ...legacyTiming,
  durationSec: voiceMeta.durationSec as number,
  voiceStartSec: voiceMeta.voice.startSec as number,
  voiceEndSec: voiceMeta.voice.endSec as number,
}

const STEM_BG = voiceMeta.audio.stemBackground as string
const STEM_VOICE = voiceMeta.audio.stemVoiceBuried as string
const ISOLATED_SRC = voiceMeta.audio.isolated as string

/** Exportável após conclusão — mesmo asset que a evidência derivada. */
export const PUZZLE03_CLUB_VOICE_ISOLATED_SRC = ISOLATED_SRC

/** @deprecated legado — IDs antigos de Link Source; mantidos para testes/migration. */
export const puzzle03CorrectSetId = 'vtx-set-20-c'
export const puzzle03CorrectSetSourceId = 'set_vtx_20_c'

export const puzzle03SpeechSegments: SpeechSegment[] = [
  {
    id: voiceMeta.voice.segmentId as string,
    text: voiceMeta.voice.recoveredText as string,
    startSec: voiceMeta.voice.startSec as number,
    durationSec: (voiceMeta.voice.endSec as number) - (voiceMeta.voice.startSec as number),
    clarityThreshold: 0.32,
    /** P03 = só redução espectral (sem notch); pesos alinhados ao P01 «seg_cadeia». */
    recoveryWeights: { center: 0.05, depth: 0.05, width: 0.05, noise: 0.85 },
    voiceWeight: 1.1,
    noiseWeight: 1.4,
    debrisWeight: 0.25,
  },
]

export const puzzle03Ideal = {
  profileStartSec: voiceMeta.noiseProfileWindow.startSec as number,
  profileEndSec: voiceMeta.noiseProfileWindow.endSec as number,
  spectralReduction: 52,
  spectralSensitivity: 44,
  spectralSmoothing: 20,
  unlockHoldSec: 0.55,
} as const

const recording: ForensicSource = {
  id: 'rec_vtx_old_01',
  filename: 'REC_VTX_OLD_01.m4a',
  displayName: 'REC_VTX_OLD_01.m4a',
  type: 'audio',
  durationSec: puzzle03Timing.durationSec,
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
    { key: 'filename', label: 'Filename', value: 'REC_VTX_OLD_01.m4a' },
    { key: 'container', label: 'Container', value: 'MPEG-4 / AAC' },
    { key: 'duration', label: 'Duration', value: '03:00.000' },
    { key: 'channels', label: 'Channels', value: '1' },
    { key: 'sampleRate', label: 'Sample rate', value: '44100 Hz' },
    { key: 'source', label: 'Source', value: 'WhatsApp · cópia enviada por Rafael (origem anterior: Mariana)' },
    { key: 'chain', label: 'Chain', value: 'Mariana → Rafael → Augusto' },
    {
      key: 'note',
      label: 'Note',
      value: 'Balada — fala masculina perceptível no arrasto; identidade não determinável só pelo registro bruto.',
    },
    { key: 'size', label: 'Size', value: '~4.2 MB' },
    { key: 'hash', label: 'Hash', value: 'sha1:c3a9…7e21' },
  ],
  structure: {
    kind: 'm4a',
    emptyMessage: 'No editable structure for this source.',
  },
  noiseRegions: [
    {
      id: 'club-bed',
      startSec: voiceMeta.noiseProfileWindow.startSec as number,
      endSec: voiceMeta.noiseProfileWindow.endSec as number,
      minOverlapRatio: 0.55,
    },
  ],
  speechSegments: puzzle03SpeechSegments,
  audio: {
    sampleRate: 44100,
    channels: 1,
    seed: 2031103,
    recovery: {
      idealNotchCenterHz: 0,
      idealNotchWidthHz: 0,
      idealNotchReductionDb: 0,
      idealProfileStartSec: puzzle03Ideal.profileStartSec,
      idealProfileEndSec: puzzle03Ideal.profileEndSec,
      idealSpectralReduction: puzzle03Ideal.spectralReduction,
      idealSpectralSensitivity: puzzle03Ideal.spectralSensitivity,
      idealSpectralSmoothing: puzzle03Ideal.spectralSmoothing,
      unlockHoldSec: puzzle03Ideal.unlockHoldSec,
    },
    waveform: buildCompositeWaveform({
      durationSec: puzzle03Timing.durationSec,
      seed: 2031103,
      noiseFloor: 0.28,
      voice: [
        { startSec: 0, endSec: legacyTiming.djStartSec, amplitude: 0.7 },
        { startSec: legacyTiming.djEndSec, endSec: puzzle03Timing.voiceStartSec, amplitude: 0.78 },
        {
          startSec: puzzle03Timing.voiceStartSec,
          endSec: puzzle03Timing.voiceEndSec,
          amplitude: 0.54,
        },
        { startSec: puzzle03Timing.voiceEndSec, endSec: puzzle03Timing.durationSec, amplitude: 0.72 },
      ],
    }),
    stems: [
      {
        id: 'BACKGROUND_NOISE',
        kind: 'file',
        initialGain: 1,
        src: STEM_BG,
      },
      {
        id: 'VOICE',
        kind: 'file',
        initialGain: 3.2,
        src: STEM_VOICE,
      },
    ],
  },
}

/**
 * Sessão ANÉIS — gravação de balada; isolar voz masculina incidental (sem fingerprint de identidade).
 */
export const puzzle03AnelsSession: ForensicSession = {
  id: 'puzzle-03-anels',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'rec_vtx_old_01',
  completion: {
    kind: 'speech-recovery',
    onCompleteAction: 'runProvisionalRingsAnalysis',
    requireSpeechSegmentIds: [voiceMeta.voice.segmentId as string],
  },
  sources: [recording],
}