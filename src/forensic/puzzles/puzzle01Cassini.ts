import type {
  AudioClipConfig,
  DebrisFragment,
  ForensicSession,
  NotchRule,
  SpectralRule,
  SpeechSegment,
} from '../forensicTypes'
import { buildCompositeSpectrogram, buildCompositeSpectrum, buildCompositeWaveform } from '../forensicMix'

const BASE = '/assets/audio/forensic/puzzle01'

/**
 * Puzzle 1 — Divisão de Cassini.
 * Progressão: Center → Depth → Depth+ → Width → Noise Profile + Spectral.
 */
const SRC = {
  corrupted: `${BASE}/p01_corrupted_base.wav`,
  a: `${BASE}/p01_mariana_01_escute.mp3`,
  b: `${BASE}/p01_mariana_02_noite.mp3`,
  c: `${BASE}/p01_mariana_03_medo.mp3`,
  d: `${BASE}/p01_mariana_04_confusa.mp3`,
  e: `${BASE}/p01_mariana_05_lembro.mp3`,
} as const

const CLIPS: AudioClipConfig[] = [
  { id: 'c1', src: SRC.a, startSec: 4.0, durationSec: 2.508, gainDb: -1 },
  { id: 'c2', src: SRC.b, startSec: 12.5, durationSec: 1.593, gainDb: -2 },
  { id: 'c3', src: SRC.c, startSec: 22.0, durationSec: 1.045, gainDb: 0 },
  { id: 'c4', src: SRC.d, startSec: 29.5, durationSec: 1.071, gainDb: -1 },
  // gainDb mais baixo: no raw a presença de voz existe, mas a frase não deve ser clara.
  { id: 'c5', src: SRC.e, startSec: 38.5, durationSec: 0.967, gainDb: -6 },
]

/**
 * Pesos e thresholds calibrados para a progressão Center → Depth → Width → Noise.
 * Score 0..1; unlock contínuo (não binário).
 */
export const puzzle01SpeechSegments: SpeechSegment[] = [
  {
    id: 'seg_escute',
    clipId: 'c1',
    text: 'escute isso até o fim',
    startSec: 4.0,
    durationSec: 2.508,
    clarityThreshold: 0.9,
    recoveryWeights: { center: 0.25, depth: 0.45, width: 0.3, noise: 0 },
    voiceWeight: 0.9,
    toneWeight: 2.8,
    noiseWeight: 0.35,
    debrisWeight: 0.4,
  },
  {
    id: 'seg_noite',
    clipId: 'c2',
    text: 'desde aquela noite',
    startSec: 12.5,
    durationSec: 1.593,
    clarityThreshold: 0.78,
    recoveryWeights: { center: 0.05, depth: 0.05, width: 0.05, noise: 0.85 },
    voiceWeight: 0.95,
    toneWeight: 0.18,
    noiseWeight: 2.4,
    debrisWeight: 2.1,
  },
  {
    id: 'seg_medo',
    clipId: 'c3',
    text: 'eu estava com medo',
    startSec: 22.0,
    durationSec: 1.045,
    clarityThreshold: 0.68,
    recoveryWeights: { center: 0.45, depth: 0.45, width: 0.1, noise: 0 },
    voiceWeight: 1.0,
    toneWeight: 1.15,
    noiseWeight: 0.3,
    debrisWeight: 0.35,
  },
  {
    id: 'seg_confusa',
    clipId: 'c4',
    text: 'eu estava confusa',
    startSec: 29.5,
    durationSec: 1.071,
    clarityThreshold: 0.78,
    recoveryWeights: { center: 0.3, depth: 0.55, width: 0.15, noise: 0 },
    voiceWeight: 0.95,
    toneWeight: 1.85,
    noiseWeight: 0.35,
    debrisWeight: 0.4,
  },
  {
    id: 'seg_lembro',
    clipId: 'c5',
    text: 'eu não lembro',
    startSec: 38.5,
    durationSec: 0.967,
    clarityThreshold: 0.7,
    recoveryWeights: { center: 0.8, depth: 0.15, width: 0.05, noise: 0 },
    voiceWeight: 1.0,
    // Máscara extra no raw / parcialmente processado — só notch adequado + playback abre a frase.
    toneWeight: 1.55,
    noiseWeight: 0.55,
    debrisWeight: 0.7,
  },
]

const DEBRIS: DebrisFragment[] = [
  { src: SRC.a, sourceOffsetSec: 0.02, durationMs: 46, timelineSec: 2.28, gainDb: -22, reverse: false },
  { src: SRC.b, sourceOffsetSec: 0.04, durationMs: 52, timelineSec: 2.62, gainDb: -24, reverse: true },
  { src: SRC.a, sourceOffsetSec: 2.3, durationMs: 70, timelineSec: 6.72, gainDb: -20, reverse: false },
  { src: SRC.c, sourceOffsetSec: 0.01, durationMs: 40, timelineSec: 7.55, gainDb: -18, reverse: true },
  { src: SRC.d, sourceOffsetSec: 0.08, durationMs: 88, timelineSec: 9.1, gainDb: -22, reverse: false },
  { src: SRC.e, sourceOffsetSec: 0.55, durationMs: 60, timelineSec: 10.85, gainDb: -20, reverse: true },
  // Concentração de debris em torno de "desde aquela noite"
  { src: SRC.b, sourceOffsetSec: 0.1, durationMs: 110, timelineSec: 12.35, gainDb: -10, reverse: false },
  { src: SRC.b, sourceOffsetSec: 0.4, durationMs: 95, timelineSec: 12.55, gainDb: -8, reverse: true },
  { src: SRC.a, sourceOffsetSec: 0.5, durationMs: 80, timelineSec: 12.75, gainDb: -11, reverse: true },
  { src: SRC.b, sourceOffsetSec: 0.9, durationMs: 100, timelineSec: 13.05, gainDb: -9, reverse: false },
  { src: SRC.c, sourceOffsetSec: 0.2, durationMs: 70, timelineSec: 13.35, gainDb: -12, reverse: true },
  { src: SRC.b, sourceOffsetSec: 1.2, durationMs: 90, timelineSec: 13.7, gainDb: -10, reverse: true },
  { src: SRC.d, sourceOffsetSec: 0.3, durationMs: 85, timelineSec: 14.0, gainDb: -11, reverse: false },
  { src: SRC.b, sourceOffsetSec: 1.35, durationMs: 64, timelineSec: 11.7, gainDb: -24, reverse: true },
  { src: SRC.a, sourceOffsetSec: 1.1, durationMs: 48, timelineSec: 14.35, gainDb: -21, reverse: true },
  { src: SRC.c, sourceOffsetSec: 0.62, durationMs: 78, timelineSec: 16.15, gainDb: -19, reverse: false },
  { src: SRC.d, sourceOffsetSec: 0.72, durationMs: 55, timelineSec: 18.4, gainDb: -23, reverse: true },
  { src: SRC.e, sourceOffsetSec: 0.12, durationMs: 42, timelineSec: 20.55, gainDb: -20, reverse: false },
  { src: SRC.b, sourceOffsetSec: 0.22, durationMs: 90, timelineSec: 23.35, gainDb: -22, reverse: true },
  { src: SRC.a, sourceOffsetSec: 0.4, durationMs: 58, timelineSec: 25.8, gainDb: -24, reverse: true },
  { src: SRC.c, sourceOffsetSec: 0.88, durationMs: 70, timelineSec: 27.9, gainDb: -19, reverse: false },
  { src: SRC.d, sourceOffsetSec: 0.02, durationMs: 50, timelineSec: 30.85, gainDb: -21, reverse: true },
  { src: SRC.e, sourceOffsetSec: 0.7, durationMs: 80, timelineSec: 33.4, gainDb: -22, reverse: true },
  { src: SRC.b, sourceOffsetSec: 0.9, durationMs: 44, timelineSec: 36.15, gainDb: -20, reverse: false },
  { src: SRC.a, sourceOffsetSec: 1.8, durationMs: 62, timelineSec: 37.55, gainDb: -23, reverse: true },
  { src: SRC.c, sourceOffsetSec: 0.2, durationMs: 48, timelineSec: 39.75, gainDb: -18, reverse: true },
  { src: SRC.d, sourceOffsetSec: 0.4, durationMs: 96, timelineSec: 40.85, gainDb: -22, reverse: true },
  // Debris leve extra sob "eu não lembro" (raw menos inteligível; notch + play recupera).
  { src: SRC.e, sourceOffsetSec: 0.05, durationMs: 85, timelineSec: 38.35, gainDb: -12, reverse: true },
  { src: SRC.a, sourceOffsetSec: 0.3, durationMs: 70, timelineSec: 38.55, gainDb: -14, reverse: false },
  { src: SRC.e, sourceOffsetSec: 0.4, durationMs: 90, timelineSec: 38.75, gainDb: -11, reverse: true },
  { src: SRC.b, sourceOffsetSec: 0.15, durationMs: 65, timelineSec: 39.05, gainDb: -13, reverse: true },
]

const VOICE_WINDOWS = CLIPS.map((c) => ({
  startSec: c.startSec,
  endSec: c.startSec + (c.durationSec ?? 0),
  amplitude: 0.55 + 0.2 * Math.pow(10, ((c.gainDb ?? 0) + 4) / 28),
  weight: 0.55 + 0.2 * Math.pow(10, ((c.gainDb ?? 0) + 4) / 24),
}))

/** Tom forte nas falas notch-dependentes; quase ausente em "noite". */
const TONE_WINDOWS = [
  { startSec: 3.7, endSec: 6.9, gain: 2.85, weight: 2.85 },
  { startSec: 12.2, endSec: 14.4, gain: 0.2, weight: 0.2 },
  { startSec: 21.75, endSec: 23.35, gain: 1.25, weight: 1.25 },
  { startSec: 29.2, endSec: 30.9, gain: 2.05, weight: 2.05 },
  // Tom mais forte sob "eu não lembro" no raw (notch 1700 deve importar).
  { startSec: 38.2, endSec: 39.75, gain: 1.85, weight: 1.85 },
]

/** Ruído elevado em "desde aquela noite". */
const NOISE_ENVELOPE = [
  { startSec: 0, endSec: 44, gain: 0.85 },
  { startSec: 11.8, endSec: 14.8, gain: 2.55 },
]

export const puzzle01NotchRule: NotchRule = {
  targetHz: 1700,
  fullEffectHz: 50,
  strongEffectHz: 100,
  partialEffectHz: 200,
  tailHz: 280,
  idealWidthHz: 180,
  wideWidthHz: 900,
  fullReductionDb: 24,
  maxAttenuationDb: 38,
}

export const puzzle01SpectralRule: SpectralRule = {
  maxNoiseCutDb: 32,
  noiseFloor: 0.24,
  maxDebrisCutDb: 20,
  debrisFloor: 0.34,
  maxVoiceCutDb: 28,
}

export const puzzle01Ideal = {
  notchCenterHz: 1700,
  notchWidthHz: 180,
  notchReductionDb: -24,
  profileStartSec: 0.3,
  profileEndSec: 1.8,
  spectralReduction: 72,
  spectralSensitivity: 55,
  spectralSmoothing: 30,
  unlockHoldSec: 0.7,
} as const

const DURATION = 44

export const puzzle01CassiniSession: ForensicSession = {
  id: 'puzzle-01-cassini',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'emergency_call_raw',
  completion: {
    kind: 'speech-recovery',
    onCompleteAction: 'runProvisionalEmergencyAnalysis',
  },
  sources: [
    {
      id: 'emg_0803',
      filename: 'EMG_0803.wav',
      displayName: 'EMG_0803.wav',
      type: 'audio',
      durationSec: DURATION,
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
        { key: 'filename', label: 'Filename', value: 'EMG_0803.wav' },
        { key: 'container', label: 'Container', value: 'WAV' },
        { key: 'codec', label: 'Codec', value: 'PCM' },
        { key: 'duration', label: 'Duration', value: '00:44.00' },
        { key: 'channels', label: 'Channels', value: '1' },
        { key: 'sampleRate', label: 'Sample rate', value: '44100 Hz' },
        { key: 'bitDepth', label: 'Bit depth', value: '16' },
        { key: 'created', label: 'Created', value: '2026-11-03 08:03:12' },
        { key: 'modified', label: 'Modified', value: '' },
        { key: 'source', label: 'Source', value: 'case-file extract' },
        { key: 'size', label: 'Size', value: '3.8 MB' },
        { key: 'hash', label: 'Hash', value: 'sha1:7c2a…e91f' },
      ],
      structure: {
        kind: 'wav-pcm',
        emptyMessage: 'Este formato não possui estrutura editável disponível.',
      },
      packets: {
        emptyMessage: 'Nenhuma estrutura de pacotes disponível para esta fonte.',
      },
      timing: {
        sourceClock: undefined,
      },
      noiseRegions: [
        { id: 'ideal', startSec: 0.3, endSec: 1.8, minOverlapRatio: 0.7 },
        { id: 'pre-wide', startSec: 0, endSec: 3.7, minOverlapRatio: 0.75 },
        { id: 'gap-a', startSec: 7.0, endSec: 12.1, minOverlapRatio: 0.7 },
        { id: 'gap-b', startSec: 14.4, endSec: 21.6, minOverlapRatio: 0.7 },
        { id: 'gap-c', startSec: 23.4, endSec: 29.1, minOverlapRatio: 0.7 },
        { id: 'gap-d', startSec: 31.0, endSec: 38.1, minOverlapRatio: 0.7 },
        { id: 'post', startSec: 39.9, endSec: 44.0, minOverlapRatio: 0.7 },
      ],
      speechSegments: puzzle01SpeechSegments,
      audio: {
        sampleRate: 44100,
        channels: 1,
        seed: 3110803,
        notch: puzzle01NotchRule,
        spectral: puzzle01SpectralRule,
        recovery: {
          idealNotchCenterHz: puzzle01Ideal.notchCenterHz,
          idealNotchWidthHz: puzzle01Ideal.notchWidthHz,
          idealNotchReductionDb: puzzle01Ideal.notchReductionDb,
          idealProfileStartSec: puzzle01Ideal.profileStartSec,
          idealProfileEndSec: puzzle01Ideal.profileEndSec,
          idealSpectralReduction: puzzle01Ideal.spectralReduction,
          idealSpectralSensitivity: puzzle01Ideal.spectralSensitivity,
          idealSpectralSmoothing: puzzle01Ideal.spectralSmoothing,
          unlockHoldSec: puzzle01Ideal.unlockHoldSec,
        },
        waveform: buildCompositeWaveform({
          durationSec: DURATION,
          seed: 3110803,
          noiseFloor: 0.42,
          voice: VOICE_WINDOWS,
        }),
        spectrum: buildCompositeSpectrum(puzzle01NotchRule.targetHz),
        spectrogram: buildCompositeSpectrogram({
          durationSec: DURATION,
          peakHz: puzzle01NotchRule.targetHz,
          voice: VOICE_WINDOWS,
          tone: TONE_WINDOWS,
        }),
        stems: [
          {
            id: 'CORRUPTED_BASE',
            kind: 'file',
            initialGain: 1,
            src: SRC.corrupted,
          },
          {
            id: 'VOICE',
            kind: 'clips',
            initialGain: 1,
            matchRmsDb: -10,
            clips: CLIPS,
          },
          {
            id: 'BACKGROUND_NOISE',
            kind: 'noise',
            initialGain: 0.78,
            seed: 3110803,
            targetRmsDb: -18,
            envelope: NOISE_ENVELOPE,
            dropouts: [
              { timeSec: 8.9, durationMs: 45, gain: 0.2 },
              { timeSec: 17.4, durationMs: 35, gain: 0.15 },
              { timeSec: 28.7, durationMs: 40, gain: 0.25 },
              { timeSec: 35.5, durationMs: 30, gain: 0.2 },
            ],
          },
          {
            id: 'TONE_1700',
            kind: 'tone',
            initialGain: 0.12,
            frequencyHz: 1700,
            envelope: TONE_WINDOWS.map(({ startSec, endSec, gain }) => ({ startSec, endSec, gain })),
          },
          {
            id: 'VOCAL_DEBRIS',
            kind: 'debris',
            initialGain: 0.62,
            fragments: DEBRIS,
          },
          {
            id: 'CLICKS',
            kind: 'clicks',
            initialGain: 0.38,
            seed: 80312,
            events: [
              { timeSec: 3.2, durationMs: 12, amplitude: 0.55 },
              { timeSec: 8.15, durationMs: 8, amplitude: 0.4 },
              { timeSec: 15.05, durationMs: 14, amplitude: 0.5 },
              { timeSec: 19.1, durationMs: 6, amplitude: 0.32 },
              { timeSec: 26.4, durationMs: 11, amplitude: 0.48 },
              { timeSec: 34.7, durationMs: 9, amplitude: 0.36 },
              { timeSec: 41.3, durationMs: 16, amplitude: 0.44 },
            ],
          },
        ],
      },
    },
  ],
}

/** @deprecated use forensicRegistry.getForensicSessionForEvidence */
export function getForensicSessionForEvidence(evidenceId: string): ForensicSession | null {
  if (evidenceId === 'emergency_call_raw' || evidenceId === puzzle01CassiniSession.evidenceId) {
    return puzzle01CassiniSession
  }
  return null
}
