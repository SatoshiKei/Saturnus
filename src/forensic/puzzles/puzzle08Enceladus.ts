import type { ForensicSession, ForensicSource, CycleAnalysisConfig } from '../forensicTypes'
import { buildCompositeWaveform } from '../forensicMix'
import meta from './puzzle08Meta.json'

export const puzzle08DurationSec = meta.durationSec as number
export const puzzle08CycleSec = meta.cycleSec as number
export const puzzle08CycleCount = meta.cycleCount as number
export const puzzle08AnomalyIndex = meta.anomalyCycleIndex as number
export const puzzle08RecoveredText = meta.recoveredSpeech as string
export const puzzle08DifferenceScores = meta.differenceScores as number[]
export const puzzle08Boundaries = meta.boundaries as Array<{
  index: number
  startSec: number
  endSec: number
}>

export const puzzle08CycleAnalysis: CycleAnalysisConfig = {
  cycleSec: puzzle08CycleSec,
  cycleCount: puzzle08CycleCount,
  anomalyCycleIndex: puzzle08AnomalyIndex,
  boundaries: puzzle08Boundaries,
  envelopes: meta.envelopes as number[][],
  envelopeHopSec: meta.envelopeHopSec as number,
  differenceScores: puzzle08DifferenceScores,
  findSimilar: meta.findSimilar as CycleAnalysisConfig['findSimilar'],
  commonPattern: meta.commonPattern as CycleAnalysisConfig['commonPattern'],
  difference: meta.difference as CycleAnalysisConfig['difference'],
  recoveredSpeech: {
    segmentId: 'enceladus-ricardo',
    text: puzzle08RecoveredText,
    startSec: (meta.ricardoWindowSec as number[])[0]!,
  },
  residualPreviewSrc: '/assets/audio/forensic/puzzle08/p08_residual_preview.wav',
}

const source: ForensicSource = {
  id: 'AUD_0008',
  filename: 'AUD_0008.wav',
  displayName: 'AUD_0008.wav',
  type: 'audio',
  durationSec: puzzle08DurationSec,
  tracks: [{ id: 'master', name: 'MASTER', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 }],
  metadata: [
    { key: 'filename', label: 'Filename', value: 'AUD_0008.wav' },
    { key: 'container', label: 'Container', value: 'WAV PCM' },
    { key: 'duration', label: 'Duration', value: '00:48.000' },
    { key: 'channels', label: 'Channels', value: 'Mono' },
    { key: 'sampleRate', label: 'Sample rate', value: '44100 Hz' },
    { key: 'origin', label: 'Origin', value: 'WhatsApp · unknown number' },
  ],
  structure: { kind: 'wav', emptyMessage: 'No editable structure for this fragment.' },
  cycleAnalysis: puzzle08CycleAnalysis,
  audio: {
    sampleRate: 44100,
    channels: 1,
    seed: meta.seed as number,
    waveform: buildCompositeWaveform({
      durationSec: puzzle08DurationSec,
      seed: meta.seed as number,
      noiseFloor: 0.1,
      voice: puzzle08Boundaries.map((b, i) => ({
        startSec: b.startSec + 0.3,
        endSec: b.endSec - 0.3,
        amplitude: i === puzzle08AnomalyIndex ? 0.85 : 0.55,
      })),
    }),
    stems: [
      {
        id: 'FILE',
        kind: 'file',
        initialGain: 1,
        src: '/assets/audio/forensic/puzzle08/p08_enceladus_final.wav',
      },
    ],
  },
}

export const puzzle08EnceladusSession: ForensicSession = {
  id: 'puzzle-08-enceladus',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'anon_hospital_burst_audio',
  completion: {
    kind: 'cycle-difference',
    onCompleteAction: 'runEnceladusAnalysis',
    requireSpeechSegmentIds: ['enceladus-ricardo'],
  },
  sources: [source],
}
