import type { ForensicSession, ForensicSource } from '../forensicTypes'
import { buildCompositeWaveform } from '../forensicMix'

/** Ordem cronológica canônica (NEXT WRITE SLOT = 06). */
export const puzzle05ExpectedOrder = [
  'RC_SLOT_06',
  'RC_SLOT_07',
  'RC_SLOT_08',
  'RC_SLOT_09',
  'RC_SLOT_00',
  'RC_SLOT_01',
  'RC_SLOT_02',
  'RC_SLOT_03',
  'RC_SLOT_04',
  'RC_SLOT_05',
] as const

/** Ordem física da exportação (como o jogador recebe). */
export const puzzle05PhysicalOrder = [
  'RC_SLOT_00',
  'RC_SLOT_01',
  'RC_SLOT_02',
  'RC_SLOT_03',
  'RC_SLOT_04',
  'RC_SLOT_05',
  'RC_SLOT_06',
  'RC_SLOT_07',
  'RC_SLOT_08',
  'RC_SLOT_09',
] as const

export const puzzle05NextWriteSlot = 6
export const puzzle05MasterDurationSec = 324.519

/** Durações por slot (tools/audio/out/puzzle05_timing.json). */
export const puzzle05SlotDurationsSec: Record<(typeof puzzle05PhysicalOrder)[number], number> = {
  RC_SLOT_00: 32.407,
  RC_SLOT_01: 32.346,
  RC_SLOT_02: 32.312,
  RC_SLOT_03: 32.677,
  RC_SLOT_04: 32.552,
  RC_SLOT_05: 32.212,
  RC_SLOT_06: 32.482,
  RC_SLOT_07: 32.387,
  RC_SLOT_08: 32.577,
  RC_SLOT_09: 32.567,
}

function slotSource(id: (typeof puzzle05PhysicalOrder)[number], seed: number): ForensicSource {
  const durationSec = puzzle05SlotDurationsSec[id]
  return {
    id,
    filename: `${id}.mp3`,
    displayName: `${id}.mp3`,
    type: 'audio',
    durationSec,
    tracks: [{ id: 'master', name: 'MASTER', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 }],
    metadata: [
      { key: 'filename', label: 'Filename', value: `${id}.mp3` },
      { key: 'container', label: 'Container', value: 'MPEG-1 Layer III' },
      { key: 'duration', label: 'Duration', value: `${durationSec.toFixed(3)} s` },
      { key: 'slot', label: 'Physical slot', value: id.replace('RC_SLOT_', '') },
      { key: 'export', label: 'Export mode', value: 'PHYSICAL SLOT ORDER' },
      { key: 'source', label: 'Source', value: 'Rádio Costeira · logger buffer' },
    ],
    structure: { kind: 'mpeg', emptyMessage: 'No editable structure for this fragment.' },
    audio: {
      sampleRate: 44100,
      channels: 1,
      seed,
      waveform: buildCompositeWaveform({
        durationSec,
        seed,
        noiseFloor: 0.1,
        voice: [{ startSec: 0.2, endSec: durationSec - 0.2, amplitude: 0.72 }],
      }),
      stems: [
        {
          id: 'FILE',
          kind: 'file',
          initialGain: 1,
          src: `/assets/audio/forensic/puzzle05/${id}.mp3`,
        },
      ],
    },
  }
}

const loggerSource: ForensicSource = {
  id: 'rc_logger_log',
  filename: 'RC_LOGGER_BUFFER.txt',
  displayName: 'RC_LOGGER_BUFFER.txt',
  type: 'data',
  durationSec: 0,
  metadata: [
    { key: 'header', label: 'System', value: 'LOGGER BUFFER' },
    { key: 'mode', label: 'Mode', value: 'CIRCULAR' },
    { key: 'slots', label: 'Slots', value: '10' },
    { key: 'nextWrite', label: 'Next write slot', value: '06' },
    { key: 'exportMode', label: 'Export mode', value: 'PHYSICAL SLOT ORDER' },
  ],
}

export const puzzle05SaturnaliaSession: ForensicSession = {
  id: 'puzzle-05-saturnalia',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'livia_radio_archive_raw',
  completion: {
    kind: 'clip-sequence',
    onCompleteAction: 'runSaturnaliaReconstruct',
    expectedSourceOrder: [...puzzle05ExpectedOrder],
  },
  sources: [
    ...puzzle05PhysicalOrder.map((id, i) => slotSource(id, 3051000 + i)),
    loggerSource,
  ],
}
