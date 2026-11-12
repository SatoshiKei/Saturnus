import type { ForensicSession, ForensicSource } from '../forensicTypes'
import { buildCompositeWaveform } from '../forensicMix'
import { HEX_FILES, HEX_PIN, type HexFileId } from '../../data/block04/hexagonPuzzle'

export const puzzle06ExpectedPin = HEX_PIN

export const puzzle06FileOrder: HexFileId[] = [
  'UNK_01',
  'UNK_02',
  'UNK_03',
  'UNK_04',
  'UNK_05',
  'UNK_06',
]

export const puzzle06ExpectedSymbols: Record<HexFileId, string> = {
  UNK_01: 'IV',
  UNK_02: 'VIII',
  UNK_03: 'I',
  UNK_04: 'V',
  UNK_05: 'II',
  UNK_06: 'VI',
}

function unkSource(file: (typeof HEX_FILES)[number], seed: number): ForensicSource {
  return {
    id: file.id,
    filename: file.displayName,
    displayName: file.displayName,
    type: 'audio',
    durationSec: file.durationSec,
    tracks: [{ id: 'master', name: 'MASTER', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 }],
    metadata: [
      { key: 'filename', label: 'Filename', value: file.displayName },
      { key: 'container', label: 'Container', value: 'WAV PCM' },
      { key: 'duration', label: 'Duration', value: `${file.durationSec.toFixed(1)} s` },
      { key: 'sampleRate', label: 'Sample rate', value: '44100 Hz' },
      { key: 'channels', label: 'Channels', value: 'Mono' },
      { key: 'origin', label: 'Origin', value: 'Anonymous channel · sequential delivery' },
    ],
    structure: { kind: 'wav', emptyMessage: 'No editable structure for this fragment.' },
    audio: {
      sampleRate: 44100,
      channels: 1,
      seed,
      // Waveform placeholder até o decode real; espectrograma vem do STFT medido.
      waveform: buildCompositeWaveform({
        durationSec: file.durationSec,
        seed,
        noiseFloor: 0.12,
        voice: [{ startSec: 0.3, endSec: file.durationSec - 0.3, amplitude: 0.55 }],
      }),
      stems: [
        {
          id: 'FILE',
          kind: 'file',
          initialGain: 1,
          src: file.audioSrc,
        },
      ],
    },
  }
}

export const puzzle06HexagonSession: ForensicSession = {
  id: 'puzzle-06-hexagon',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: HEX_FILES[0]!.evidenceId,
  completion: {
    kind: 'spectrogram-survey',
    onCompleteAction: 'runHexagonSpectrogramSurvey',
  },
  sources: HEX_FILES.map((f, i) => unkSource(f, 4061106 + i)),
}

/** Mesma sessão registrada sob cada evidência UNK. */
export const puzzle06EvidenceIds = HEX_FILES.map((f) => f.evidenceId)
