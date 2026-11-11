import type { ForensicSession } from '../forensicTypes'
import {
  buildDemoSpectrogram,
  buildDemoSpectrum,
  buildDemoWaveform,
} from '../forensicAudio'

const BASE = '/assets/audio/puzzle01'

/**
 * Puzzle 1 — Divisão de Cassini / EMG_0803
 * Stems internos (VOICE, NOISE, TONE, DEBRIS, CLICKS) não aparecem no mixer.
 * Jogador vê apenas EMG_0803.wav / MASTER.
 */
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
      durationSec: 44,
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
        { id: 'pre', startSec: 0, endSec: 3.5, minOverlapRatio: 0.7 },
        { id: 'gap1', startSec: 8.2, endSec: 11.8, minOverlapRatio: 0.7 },
        { id: 'gap2', startSec: 17.5, endSec: 21.2, minOverlapRatio: 0.7 },
        { id: 'gap3', startSec: 26.0, endSec: 28.8, minOverlapRatio: 0.7 },
        { id: 'gap4', startSec: 34.0, endSec: 37.8, minOverlapRatio: 0.7 },
        { id: 'post', startSec: 42.0, endSec: 44.0, minOverlapRatio: 0.7 },
      ],
      transcription: [
        {
          id: 'p1',
          accepted: ['escute isso ate o fim', 'escuta isso ate o fim'],
        },
        {
          id: 'p2',
          accepted: ['desde aquela noite'],
        },
        {
          id: 'p3',
          accepted: ['eu sentia medo', 'eu estava com medo', 'eu sentia o medo'],
        },
        {
          id: 'p4',
          accepted: ['eu estava confusa', 'eu tava confusa'],
        },
        {
          id: 'p5',
          accepted: ['eu nao lembro', 'eu não lembro'],
        },
      ],
      audio: {
        sampleRate: 44100,
        channels: 1,
        waveform: buildDemoWaveform('emg_0803', 280),
        spectrum: buildDemoSpectrum(1700),
        spectrogram: buildDemoSpectrogram(44, 1700),
        stems: [
          {
            id: 'VOICE',
            kind: 'clips',
            initialGain: 0.55,
            clips: [
              { id: 'v1', src: `${BASE}/voice_01_escute.mp3`, startSec: 4.0 },
              { id: 'v2', src: `${BASE}/voice_02_desde.mp3`, startSec: 12.5 },
              { id: 'v3', src: `${BASE}/voice_03_medo.mp3`, startSec: 22.0 },
              { id: 'v4', src: `${BASE}/voice_04_confusa.mp3`, startSec: 29.5 },
              { id: 'v5', src: `${BASE}/voice_05_lembro.mp3`, startSec: 38.5 },
            ],
          },
          {
            id: 'BACKGROUND_NOISE',
            kind: 'noise',
            initialGain: 0.85,
            density: 1.1,
          },
          {
            id: 'TONE_1700',
            kind: 'tone',
            initialGain: 0.55,
            frequencyHz: 1700,
          },
          {
            id: 'VOCAL_DEBRIS',
            kind: 'debris',
            initialGain: 0.35,
            density: 0.9,
          },
          {
            id: 'CLICKS',
            kind: 'clicks',
            initialGain: 0.4,
            density: 1,
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
