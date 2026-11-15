import type { ForensicSession, ForensicSource, RfCaptureConfig } from '../forensicTypes'
import { buildDerivedRfSource } from '../forensicEngine'
import { buildCompositeWaveform } from '../forensicMix'
import meta from './puzzle07Meta.json'
import waterfall from './puzzle07Waterfall.json'
import {
  PASTOR_LOCATION_LABEL,
  PASTOR_TOKEN,
} from '../../data/block06/pastorMoonsPuzzle'

export const puzzle07CaptureId = 'INTERCEPT_0511_RF_CAPTURE'
export const puzzle07DerivedIds = {
  A: 'DERIVED_CHANNEL_462_525',
  B: 'DERIVED_CHANNEL_462_575',
  C: 'DERIVED_CHANNEL_462_625',
} as const
export const puzzle07DerivedId = puzzle07DerivedIds.B
export const puzzle07ExpectedToken = PASTOR_TOKEN
export const puzzle07ExpectedTime = meta.expectedTime as string
export const puzzle07ExpectedLocation = PASTOR_LOCATION_LABEL

export const puzzle07Frequencies = meta.frequencies as {
  A: number
  B: number
  C: number
}

export const puzzle07ExtractToleranceMhz = meta.extractToleranceMhz as number
export const puzzle07IdealBandwidthMhz = meta.idealBandwidthMhz as number
export const puzzle07MinBandwidthMhz = meta.minBandwidthMhz as number
export const puzzle07MaxBandwidthMhz = meta.maxBandwidthMhz as number

export type Puzzle07Burst = {
  id: string
  channelId: string
  centerMhz: number
  startSec: number
  durationSec: number
  power: number
  turnIndex: number
  srcStartMs: number
  srcEndMs: number
  audioSrc: string
}

export const puzzle07Bursts = meta.bursts as Puzzle07Burst[]

export const puzzle07RfCapture: RfCaptureConfig = {
  durationSec: meta.durationSec,
  freqMinMhz: (meta.freqRangeMhz as number[])[0]!,
  freqMaxMhz: (meta.freqRangeMhz as number[])[1]!,
  knownChannelIds: meta.knownChannels as string[],
  hiddenChannelId: meta.hiddenChannel as string,
  channels: [
    {
      id: 'A',
      centerMhz: puzzle07Frequencies.A,
      known: true,
      label: '462.525 MHz',
      nominalPower: 0.92,
      derived: {
        derivedSourceId: puzzle07DerivedIds.A,
        derivedAudioSrc: '/assets/audio/forensic/puzzle07/DERIVED_CHANNEL_462_525.wav',
        derivedDisplayName: 'DERIVED CHANNEL — 462.525 MHz',
        durationSec: meta.fullChannelDurationSec?.A as number | undefined,
      },
    },
    {
      id: 'B',
      centerMhz: puzzle07Frequencies.B,
      known: false,
      label: '462.575 MHz',
      nominalPower: 0.42,
      derived: {
        derivedSourceId: puzzle07DerivedIds.B,
        derivedAudioSrc: '/assets/audio/forensic/puzzle07/DERIVED_CHANNEL_462_575.wav',
        derivedDisplayName: 'DERIVED CHANNEL — 462.575 MHz',
        durationSec: meta.fullChannelDurationSec?.B as number | undefined,
      },
    },
    {
      id: 'C',
      centerMhz: puzzle07Frequencies.C,
      known: true,
      label: '462.625 MHz',
      nominalPower: 0.9,
      derived: {
        derivedSourceId: puzzle07DerivedIds.C,
        derivedAudioSrc: '/assets/audio/forensic/puzzle07/DERIVED_CHANNEL_462_625.wav',
        derivedDisplayName: 'DERIVED CHANNEL — 462.625 MHz',
        durationSec: meta.fullChannelDurationSec?.C as number | undefined,
      },
    },
  ],
  bursts: puzzle07Bursts.map((b) => ({
    id: b.id,
    channelId: b.channelId,
    centerMhz: b.centerMhz,
    startSec: b.startSec,
    durationSec: b.durationSec,
    power: b.power,
    audioSrc: b.audioSrc,
  })),
  waterfall: {
    cols: waterfall.cols,
    rows: waterfall.rows,
    freqMinMhz: waterfall.freqMinMhz,
    freqMaxMhz: waterfall.freqMaxMhz,
    durationSec: waterfall.durationSec,
    values: waterfall.values as number[],
  },
  extract: {
    hiddenCenterMhz: puzzle07Frequencies.B,
    toleranceMhz: puzzle07ExtractToleranceMhz,
    idealBandwidthMhz: puzzle07IdealBandwidthMhz,
    minBandwidthMhz: puzzle07MinBandwidthMhz,
    maxBandwidthMhz: puzzle07MaxBandwidthMhz,
    derivedSourceId: puzzle07DerivedId,
    derivedAudioSrc: '/assets/audio/forensic/puzzle07/DERIVED_CHANNEL_462_575.wav',
    derivedDisplayName: 'DERIVED CHANNEL — 462.575 MHz',
  },
  findings: {
    token: puzzle07ExpectedToken,
    timeLabel: puzzle07ExpectedTime,
    locationLabel: puzzle07ExpectedLocation,
  },
}

const captureSource: ForensicSource = {
  id: puzzle07CaptureId,
  filename: 'INTERCEPT_0511_RF_CAPTURE.wav',
  displayName: 'INTERCEPT_0511_RF_CAPTURE',
  type: 'radio',
  durationSec: meta.durationSec,
  tracks: [{ id: 'master', name: 'RF MIX', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 }],
  metadata: [
    { key: 'filename', label: 'Filename', value: 'INTERCEPT_0511_RF_CAPTURE.wav' },
    { key: 'kind', label: 'Kind', value: 'Wideband RF intercept' },
    { key: 'duration', label: 'Duration', value: '04:00.000' },
    { key: 'band', label: 'Band', value: '462.480–462.670 MHz' },
    {
      key: 'known',
      label: 'Catalogued channels',
      value: `${puzzle07Frequencies.A.toFixed(3)} · ${puzzle07Frequencies.C.toFixed(3)} MHz`,
    },
    { key: 'origin', label: 'Origin', value: 'Police intercept · Valter group radios' },
  ],
  structure: { kind: 'rf-capture', emptyMessage: 'No editable structure for this capture.' },
  rfCapture: puzzle07RfCapture,
  audio: {
    sampleRate: 44100,
    channels: 1,
    seed: meta.seed,
    waveform: buildCompositeWaveform({
      durationSec: meta.durationSec,
      seed: meta.seed as number,
      noiseFloor: 0.08,
      voice: [{ startSec: 5, endSec: meta.durationSec - 5, amplitude: 0.7 }],
    }),
    stems: [
      {
        id: 'FILE',
        kind: 'file',
        initialGain: 1,
        src: '/assets/audio/forensic/puzzle07/INTERCEPT_0511_RF_CAPTURE.wav',
      },
    ],
  },
}

/** Fonte derivada — só entra na sessão após Extract Channel bem-sucedido. */
export function buildPuzzle07DerivedSource(channelId: 'A' | 'B' | 'C' = 'B'): ForensicSource {
  return buildDerivedRfSource(puzzle07RfCapture, channelId)
}

export const puzzle07ShepherdMoonsSession: ForensicSession = {
  id: 'puzzle-07-shepherd-moons',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'valter_group_active_intercepts',
  completion: {
    kind: 'rf-channel-extract',
    onCompleteAction: 'runShepherdMoonsExtract',
  },
  sources: [captureSource],
}
