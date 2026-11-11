import type { AudioClipConfig, DebrisFragment, ForensicSession, NotchRule, SpectralRule } from '../forensicTypes'
import { buildCompositeSpectrogram, buildCompositeSpectrum, buildCompositeWaveform } from '../forensicMix'

const BASE = '/assets/audio/forensic/puzzle01'

/**
 * Puzzle 1 — Divisão de Cassini.
 * O jogador vê um único arquivo: EMG_0803.wav / MASTER.
 * Os cinco MP3 e os stems (voz, ruído, 1700 Hz, debris, clicks) ficam só no dataset.
 * Não usa o WAV degradado antigo.
 */
const SRC = {
  a: `${BASE}/p01_mariana_01_escute.mp3`,
  b: `${BASE}/p01_mariana_02_noite.mp3`,
  c: `${BASE}/p01_mariana_03_medo.mp3`,
  d: `${BASE}/p01_mariana_04_confusa.mp3`,
  e: `${BASE}/p01_mariana_05_lembro.mp3`,
} as const

const CLIPS: AudioClipConfig[] = [
  { id: 'c1', src: SRC.a, startSec: 4.0, durationSec: 2.508, gainDb: -18 },
  { id: 'c2', src: SRC.b, startSec: 12.5, durationSec: 1.593, gainDb: -20 },
  { id: 'c3', src: SRC.c, startSec: 22.0, durationSec: 1.045, gainDb: -15 },
  { id: 'c4', src: SRC.d, startSec: 29.5, durationSec: 1.071, gainDb: -17 },
  { id: 'c5', src: SRC.e, startSec: 38.5, durationSec: 0.967, gainDb: -13 },
]

/** Microfragmentos dos próprios clips. 40–120 ms, fora das cinco falas. */
const DEBRIS: DebrisFragment[] = [
  { src: SRC.a, sourceOffsetSec: 0.02, durationMs: 46, timelineSec: 2.28, gainDb: -22, reverse: false },
  { src: SRC.b, sourceOffsetSec: 0.04, durationMs: 52, timelineSec: 2.62, gainDb: -24, reverse: true },
  { src: SRC.a, sourceOffsetSec: 2.3, durationMs: 70, timelineSec: 6.72, gainDb: -20, reverse: false },
  { src: SRC.c, sourceOffsetSec: 0.01, durationMs: 40, timelineSec: 7.55, gainDb: -18, reverse: true },
  { src: SRC.d, sourceOffsetSec: 0.08, durationMs: 88, timelineSec: 9.1, gainDb: -22, reverse: false },
  { src: SRC.e, sourceOffsetSec: 0.55, durationMs: 60, timelineSec: 10.85, gainDb: -20, reverse: true },
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
]

const VOICE_WINDOWS = CLIPS.map((c) => ({
  startSec: c.startSec,
  endSec: c.startSec + (c.durationSec ?? 0),
  amplitude: Math.pow(10, ((c.gainDb ?? 0) + 18) / 28),
  weight: Math.pow(10, ((c.gainDb ?? 0) + 20) / 24),
}))

/** Envelope do tom: mais forte nas falas difíceis, mais fraco nas fáceis. */
const TONE_WINDOWS = [
  { startSec: 3.85, endSec: 6.7, gain: 2.35, weight: 2.35 },
  { startSec: 12.3, endSec: 14.3, gain: 2.75, weight: 2.75 },
  { startSec: 21.85, endSec: 23.25, gain: 0.55, weight: 0.55 },
  { startSec: 29.3, endSec: 30.8, gain: 1.45, weight: 1.45 },
  { startSec: 38.25, endSec: 39.7, gain: 0.42, weight: 0.42 },
]

export const puzzle01NotchRule: NotchRule = {
  targetHz: 1700,
  fullEffectHz: 50,
  strongEffectHz: 100,
  partialEffectHz: 200,
  tailHz: 280,
  idealWidthHz: 160,
  wideWidthHz: 900,
  fullReductionDb: 18,
  maxAttenuationDb: 36,
}

export const puzzle01SpectralRule: SpectralRule = {
  maxNoiseCutDb: 34,
  noiseFloor: 0.15,
  maxDebrisCutDb: 16,
  debrisFloor: 0.28,
  maxVoiceCutDb: 6,
}

const DURATION = 44

export const puzzle01CassiniSession: ForensicSession = {
  id: 'puzzle-01-cassini',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'emergency_call_raw',
  completion: {
    kind: 'transcription',
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
        { id: 'pre', startSec: 0.3, endSec: 2.0, minOverlapRatio: 0.7 },
        { id: 'pre-wide', startSec: 0, endSec: 3.7, minOverlapRatio: 0.7 },
        { id: 'gap-a', startSec: 7.0, endSec: 12.1, minOverlapRatio: 0.7 },
        { id: 'gap-b', startSec: 14.4, endSec: 21.6, minOverlapRatio: 0.7 },
        { id: 'gap-c', startSec: 23.4, endSec: 29.1, minOverlapRatio: 0.7 },
        { id: 'gap-d', startSec: 31.0, endSec: 38.1, minOverlapRatio: 0.7 },
        { id: 'post', startSec: 39.9, endSec: 44.0, minOverlapRatio: 0.7 },
      ],
      transcription: [
        { id: 'p1', accepted: ['escute isso até o fim'] },
        { id: 'p2', accepted: ['desde aquela noite'] },
        { id: 'p3', accepted: ['eu sentia medo'] },
        { id: 'p4', accepted: ['eu estava confusa'] },
        { id: 'p5', accepted: ['eu não lembro'] },
      ],
      audio: {
        sampleRate: 44100,
        channels: 1,
        seed: 3110803,
        notch: puzzle01NotchRule,
        spectral: puzzle01SpectralRule,
        waveform: buildCompositeWaveform({
          durationSec: DURATION,
          seed: 3110803,
          noiseFloor: 0.34,
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
            id: 'VOICE',
            kind: 'clips',
            initialGain: 1,
            matchRmsDb: -8,
            clips: CLIPS,
          },
          {
            id: 'BACKGROUND_NOISE',
            kind: 'noise',
            initialGain: 1,
            seed: 3110803,
            targetRmsDb: -19,
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
            initialGain: 0.07,
            frequencyHz: 1700,
            envelope: TONE_WINDOWS.map(({ startSec, endSec, gain }) => ({ startSec, endSec, gain })),
          },
          {
            id: 'VOCAL_DEBRIS',
            kind: 'debris',
            initialGain: 0.7,
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
