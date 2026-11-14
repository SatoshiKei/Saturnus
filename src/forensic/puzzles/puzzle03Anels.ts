import type { ForensicSession, ForensicSource } from '../forensicTypes'
import { buildCompositeWaveform } from '../forensicMix'
import {
  PUZZLE03_CANONICAL_SESSION_ID,
  PUZZLE03_TRACK_A_ID,
  PUZZLE03_TRACK_B_ID,
  puzzle03Timing,
} from './puzzle03Fingerprint'

export { puzzle03Timing }

const FINAL_SRC = '/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3'

/** @deprecated legado — IDs antigos de Link Source; mantidos para testes/migration. */
export const puzzle03CorrectSetId = 'vtx-set-20-c'
export const puzzle03CorrectSetSourceId = 'set_vtx_20_c'

export const puzzle03TrackAId = PUZZLE03_TRACK_A_ID
export const puzzle03TrackBId = PUZZLE03_TRACK_B_ID
export const puzzle03CanonicalSessionId = PUZZLE03_CANONICAL_SESSION_ID

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
    { key: 'source', label: 'Source', value: 'Arquivo histórico do Vértice' },
    { key: 'chain', label: 'Chain', value: 'Vértice → Augusto (obtido no local)' },
    { key: 'size', label: 'Size', value: '~4.2 MB' },
    { key: 'hash', label: 'Hash', value: 'sha1:c3a9…7e21' },
  ],
  structure: {
    kind: 'm4a',
    emptyMessage: 'No editable structure for this source.',
  },
  tempoRegions: [
    {
      id: 'pre',
      startSec: puzzle03Timing.preWindow.startSec,
      endSec: puzzle03Timing.preWindow.endSec,
      bpm: puzzle03Timing.actualPreTempo,
      confidence: 'high',
    },
    {
      id: 'post',
      startSec: puzzle03Timing.postWindow.startSec,
      endSec: puzzle03Timing.postWindow.endSec,
      bpm: puzzle03Timing.actualPostTempo,
      confidence: 'high',
    },
  ],
  audio: {
    sampleRate: 44100,
    channels: 1,
    seed: 2031103,
    waveform: buildCompositeWaveform({
      durationSec: puzzle03Timing.durationSec,
      seed: 2031103,
      noiseFloor: 0.22,
      voice: [
        { startSec: 0, endSec: puzzle03Timing.djStartSec, amplitude: 0.72 },
        {
          startSec: puzzle03Timing.djStartSec,
          endSec: puzzle03Timing.djEndSec,
          amplitude: 0.55,
        },
        { startSec: puzzle03Timing.djEndSec, endSec: puzzle03Timing.durationSec, amplitude: 0.78 },
      ],
    }),
    stems: [
      {
        id: 'FILE',
        kind: 'file',
        initialGain: 1,
        src: FINAL_SRC,
      },
    ],
  },
}

/**
 * Sessão ANÉIS — só o áudio histórico.
 * Sets ficam no arquivo pesquisável (`puzzle03Fingerprint`), não como sources/candidatos.
 */
export const puzzle03AnelsSession: ForensicSession = {
  id: 'puzzle-03-anels',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'rec_vtx_old_01',
  completion: {
    kind: 'fingerprint-archive',
    onCompleteAction: 'runProvisionalRingsAnalysis',
  },
  sources: [recording],
}
