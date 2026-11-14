/**
 * Puzzle 10 — Ordem dos Anéis (stub de sessão forense).
 * UI especializada: RingsSession no workspace central do ForensicWorkbench.
 */

import type { ForensicSession, ForensicSource } from '../forensicTypes'
import meta from './puzzle10Meta.json'

const noteSource: ForensicSource = {
  id: 'protest_media_bundle',
  filename: 'protest_media_bundle',
  displayName: 'protest_media_bundle',
  type: 'data',
  durationSec: 12,
  metadata: [
    { key: 'filename', label: 'Filename', value: 'protest_media_bundle' },
    { key: 'format', label: 'Format', value: 'Heterogeneous media bundle' },
    { key: 'origin', label: 'Origin', value: 'Protest materials — Livia / phone / CCTV' },
    {
      key: 'note',
      label: 'Note',
      value: 'Specialized reconstruction workspace active. Use center panel tools.',
    },
  ],
  structure: {
    kind: 'generic',
    emptyMessage: 'Timeline reconstruction runs in the specialized workspace.',
  },
  audio: {
    sampleRate: 22050,
    channels: 1,
    seed: meta.seed as number,
    waveform: Array.from({ length: 128 }, (_, i) => Math.sin(i / 7) * 0.05),
    stems: [
      {
        id: 'FILE',
        kind: 'file',
        initialGain: 1,
        src: '/assets/audio/forensic/puzzle10/livia_protest_clip.wav',
      },
    ],
  },
}

export const puzzle10RingsSession: ForensicSession = {
  id: 'puzzle-10-rings',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'protest_heterogeneous_sources',
  sources: [noteSource],
}
