import type { ForensicSession, ForensicSource } from '../forensicTypes'
import { buildCompositeWaveform } from '../forensicMix'

/** Timing gerado por tools/audio/build_puzzle03.py (valores de construção). */
export const puzzle03Timing = {
  durationSec: 180,
  djStartSec: 72.0,
  djEndSec: 90.678,
  djDurationSec: 18.678,
  actualPreTempo: 126.1,
  actualPostTempo: 128.0,
  duckAmount: 0.42,
  preWindow: { startSec: 8.0, endSec: 68.0 },
  postWindow: { startSec: 96.0, endSec: 150.0 },
} as const

const FINAL_SRC = '/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3'

export const puzzle03CorrectSetId = 'vtx-set-20-c'
export const puzzle03CorrectSetSourceId = 'set_vtx_20_c'

function setSource(
  id: string,
  filename: string,
  fields: {
    setId: string
    operatorLabel: string
    bpmBefore: number
    bpmAfter: number
    interventionStartSec: number
    interventionEndSec: number
    notes: string
    isCorrectMatch?: boolean
  },
): ForensicSource {
  return {
    id,
    filename,
    displayName: filename,
    type: 'data',
    durationSec: 0,
    metadata: [
      { key: 'setId', label: 'Record ID', value: fields.setId },
      { key: 'operator', label: 'Operator / DJ', value: fields.operatorLabel },
      { key: 'bpmBefore', label: 'Tempo before transition', value: `${fields.bpmBefore.toFixed(1)} BPM` },
      { key: 'bpmAfter', label: 'Tempo after transition', value: `${fields.bpmAfter.toFixed(1)} BPM` },
      {
        key: 'intervention',
        label: 'Mic intervention window',
        value: `${fields.interventionStartSec.toFixed(1)} s – ${fields.interventionEndSec.toFixed(1)} s`,
      },
      { key: 'notes', label: 'Technical note', value: fields.notes },
    ],
    setRecord: { ...fields },
  }
}

export const puzzle03AnelsSession: ForensicSession = {
  id: 'puzzle-03-anels',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'rec_vtx_old_01',
  completion: {
    kind: 'source-link',
    onCompleteAction: 'runProvisionalRingsAnalysis',
    correctSetSourceId: puzzle03CorrectSetSourceId,
  },
  sources: [
    {
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
        { key: 'source', label: 'Source', value: 'WhatsApp · Rafael (cópia de Mariana)' },
        { key: 'chain', label: 'Chain', value: 'Mariana → Rafael → Augusto' },
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
    },
    // Candidato A — 126→126 (não sobe)
    setSource('set_vtx_20_a', 'VTX-SET-20-A.log', {
      setId: 'VTX-SET-20-A',
      operatorLabel: 'Operador A',
      bpmBefore: 126.0,
      bpmAfter: 126.0,
      interventionStartSec: 70.0,
      interventionEndSec: 88.0,
      notes: 'Transição de set não registrada. Mic open ~70–88 s.',
    }),
    // Candidato B — 126→128 mas intervenção fora do lugar
    setSource('set_vtx_20_b', 'VTX-SET-20-B.log', {
      setId: 'VTX-SET-20-B',
      operatorLabel: 'Operador B',
      bpmBefore: 126.2,
      bpmAfter: 128.1,
      interventionStartSec: 40.0,
      interventionEndSec: 55.0,
      notes: 'Mic intervention early in the hour. Tempo shift after cue.',
    }),
    // Candidato C — NICO (correto)
    setSource(puzzle03CorrectSetSourceId, 'VTX-SET-20-C.log', {
      setId: 'VTX-SET-20-C',
      operatorLabel: 'Nicolas Prado Reis (“Nico”)',
      bpmBefore: 126.1,
      bpmAfter: 128.0,
      interventionStartSec: 72.0,
      interventionEndSec: 90.7,
      notes: 'Legacy desk ducking on mic open. Transition near end of announcement.',
      isCorrectMatch: true,
    }),
    // Candidato D — 128 desde o início
    setSource('set_vtx_20_d', 'VTX-SET-20-D.log', {
      setId: 'VTX-SET-20-D',
      operatorLabel: 'Operador C',
      bpmBefore: 128.0,
      bpmAfter: 128.0,
      interventionStartSec: 71.5,
      interventionEndSec: 89.0,
      notes: 'Constant tempo session. Mic open mid-block.',
    }),
  ],
}
